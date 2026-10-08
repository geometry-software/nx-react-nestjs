import type { SupabaseClient } from "@supabase/supabase-js";
import {
  RepositoryNotFoundError,
  RepositoryOperationError,
  RepositoryValidationError,
} from "../core/errors.js";
import {
  type BulkDeleteResult,
  type PaginatedResult,
  type PageableOptions,
} from "../core/api.js";
import { isValidPageQuery } from "../utils/is-valid-page-query.js";
import type {
  SupabaseFilter,
  SupabaseJsQueryPort,
  SupabaseJsAdapterPort,
  SupabaseJsRepositoryQuery,
} from "./types.js";

export type SupabaseJsAdapterOptions<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> = {
  source: string;
  client: SupabaseClient;
  options: { entityName: string; pageable?: PageableOptions<TEntity> };
  idColumn?: string;
};

export function createSupabaseJsAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
>(
  options: SupabaseJsAdapterOptions<TEntity, TCreate, TUpdate>,
): SupabaseJsAdapter<TEntity, TCreate, TUpdate> {
  return new SupabaseJsAdapter(
    options.client,
    options.source,
    options.options,
    options.idColumn,
  );
}

export class SupabaseJsAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> implements
    SupabaseJsAdapterPort<TEntity, TCreate, TUpdate>,
    SupabaseJsQueryPort<TEntity>
{
  constructor(
    private readonly client: SupabaseClient,
    private source: string,
    private readonly options: { entityName: string; pageable?: PageableOptions<TEntity> },
    private readonly idColumn = "id",
  ) {}

  /** Returns the currently selected collection or table. */
  public getSource(): string {
    return this.source;
  }

  /** Selects the collection or table used by subsequent operations. */
  public setSource(source: string): void {
    this.source = source;
  }

  /** Returns every record from the selected source. */
  public async findAll(): Promise<TEntity[]> {
    const entities: TEntity[] = [];
    const batchSize = 1000;
    while (true) {
      const { data, error } = await this.client
        .from(this.source)
        .select('*')
        .order(this.idColumn, { ascending: true })
        .range(entities.length, entities.length + batchSize - 1);
      if (error) throw new RepositoryOperationError('findAll');
      if (!data?.length) return entities;
      entities.push(...data.map((record) => this.decode(record as Record<string, unknown>)));
    }
  }

  /** Parses a JSON page request and returns its matching records. */
  public async query(expression: string): Promise<TEntity[]> {
    let request: SupabaseJsRepositoryQuery<TEntity>;
    try {
      request = JSON.parse(expression) as SupabaseJsRepositoryQuery<TEntity>;
    } catch {
      throw new RepositoryValidationError('Supabase JS query must be JSON');
    }
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      throw new RepositoryValidationError('Supabase JS query must be a JSON object');
    }
    return (await this.findPage(request)).data;
  }

  /** Returns a page of records using provider-specific filtering and ordering. */
  public async findPage(query: SupabaseJsRepositoryQuery<TEntity>): Promise<PaginatedResult<TEntity>> {
    if (!isValidPageQuery(query)) {
      throw new RepositoryValidationError(
        "Supabase JS pagination requires positive integer page and limit values",
      );
    }
    const from = (query.page - 1) * query.limit;
    let request = this.client
      .from(this.source)
      .select("*", { count: "exact" });

    for (const filter of query.filters ?? []) {
      request = this.applyFilter(request, filter);
    }

    const defaultSort = this.options.pageable?.defaultSort;
    const order = query.order?.length
      ? query.order
      : defaultSort
        ? [{ column: defaultSort, direction: "desc" as const }]
        : [];
    for (const item of order) {
      const column = this.options.pageable?.sortFieldMap?.[item.column] ?? item.column;
      request = request.order(column, {
        ascending: item.direction === "asc",
      });
    }

    const { data, error, count } = await request.range(
      from,
      from + query.limit - 1,
    );
    if (error) throw new RepositoryOperationError("findAll");

    const total = count ?? 0;
    return {
      data: (data ?? []).map((record) =>
        this.decode(record as Record<string, unknown>),
      ),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  /** Creates a record and returns its stored representation. */
  public async create(value: TEntity | TCreate): Promise<TEntity> {
    const now = new Date().toISOString();
    const record = { ...value, createdAt: now, updatedAt: now };
    const { data, error } = await this.client
      .from(this.source)
      .insert(record as TEntity & { createdAt: string; updatedAt: string })
      .select()
      .single();
    if (error) throw new RepositoryOperationError("create");
    return this.decode(data as Record<string, unknown>);
  }

  /** Returns a record by ID or raises a not-found error. */
  async findOne(id: string): Promise<TEntity> {
    const { data, error } = await this.client
      .from(this.source)
      .select()
      .eq(this.idColumn, id)
      .maybeSingle();
    if (error) throw new RepositoryOperationError("findOne");
    if (!data) throw new RepositoryNotFoundError(this.options.entityName, id);
    return this.decode(data as Record<string, unknown>);
  }

  /** Updates a record by ID and returns its current representation. */
  async update(id: string, value: TUpdate): Promise<TEntity> {
    await this.findOne(id);
    const record = { ...value, updatedAt: new Date().toISOString() };
    const { data, error } = await this.client
      .from(this.source)
      .update(record)
      .eq(this.idColumn, id)
      .select()
      .single();
    if (error) throw new RepositoryOperationError("update");
    return this.decode(data as Record<string, unknown>);
  }

  /** Deletes a record by ID or raises a not-found error. */
  async remove(id: string): Promise<{ deleted: true }> {
    await this.findOne(id);
    const { error } = await this.client
      .from(this.source)
      .delete()
      .eq(this.idColumn, id);
    if (error) throw new RepositoryOperationError("remove");
    return { deleted: true };
  }

  /** Deletes the supplied IDs and reports the number removed. */
  async removeMany(ids: string[]): Promise<BulkDeleteResult> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return { deleted: 0 };
    const { data, error } = await this.client
      .from(this.source)
      .delete()
      .in(this.idColumn, uniqueIds)
      .select(this.idColumn);
    if (error) throw new RepositoryOperationError("removeMany");
    return { deleted: data?.length ?? 0 };
  }

  private decode(record: Record<string, unknown>): TEntity {
    return { ...record } as TEntity;
  }

  private applyFilter<TRequest extends SupabaseFilterRequest>(
    request: TRequest,
    filter: SupabaseFilter<TEntity>,
  ): TRequest {
    const column = filter.column;
    switch (filter.operator) {
      case "eq":
        return request.eq(column, filter.value) as TRequest;
      case "neq":
        return request.neq(column, filter.value) as TRequest;
      case "gt":
        return request.gt(column, filter.value) as TRequest;
      case "gte":
        return request.gte(column, filter.value) as TRequest;
      case "lt":
        return request.lt(column, filter.value) as TRequest;
      case "lte":
        return request.lte(column, filter.value) as TRequest;
      case "like":
        return request.like(column, String(filter.value)) as TRequest;
      case "ilike":
        return request.ilike(column, String(filter.value)) as TRequest;
      case "in":
        return request.in(
          column,
          Array.isArray(filter.value) ? filter.value : [filter.value],
        ) as TRequest;
      case "is":
        return request.is(
          column,
          filter.value as null | boolean,
        ) as TRequest;
    }
  }
}

type SupabaseFilterRequest = {
  eq(column: string, value: unknown): unknown;
  neq(column: string, value: unknown): unknown;
  gt(column: string, value: unknown): unknown;
  gte(column: string, value: unknown): unknown;
  lt(column: string, value: unknown): unknown;
  lte(column: string, value: unknown): unknown;
  like(column: string, value: string): unknown;
  ilike(column: string, value: string): unknown;
  in(column: string, values: readonly unknown[]): unknown;
  is(column: string, value: null | boolean): unknown;
};
