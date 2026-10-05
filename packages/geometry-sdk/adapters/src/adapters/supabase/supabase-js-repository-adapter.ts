import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createObjectStorageCodec,
  type RepositoryStorageCodec,
} from "../storage-codec.js";
import {
  RepositoryNotFoundError,
  RepositoryOperationError,
  RepositoryValidationError,
} from "../core/errors.js";
import { isValidPageQuery } from "../core/query.js";
import type { CollectionApiAdapterOptions } from "../core/repository.js";
import type {
  BulkDeleteResult,
  PaginatedResult,
  RepositoryOptions,
  RepositoryRecord,
} from "../core/types.js";
import type {
  SupabaseFilter,
  SupabaseJsQueryPort,
  SupabaseJsRepositoryAdapterPort,
  SupabaseJsRepositoryQuery,
} from "./types.js";

export type SupabaseJsAdapterOptions<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> = CollectionApiAdapterOptions & {
  client: SupabaseClient;
  options: RepositoryOptions<TEntity>;
  codec?: RepositoryStorageCodec<TEntity, TCreate, TUpdate>;
  idColumn?: string;
};

export function createSupabaseJsAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
>(
  options: SupabaseJsAdapterOptions<TEntity, TCreate, TUpdate>,
): SupabaseJsRepositoryAdapter<TEntity, TCreate, TUpdate> {
  return new SupabaseJsRepositoryAdapter(
    options.client,
    options.source,
    options.options,
    options.codec,
    options.idColumn,
  );
}

export class SupabaseJsRepositoryAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> implements
    SupabaseJsRepositoryAdapterPort<TEntity, TCreate, TUpdate>,
    SupabaseJsQueryPort<TEntity>
{
  constructor(
    private readonly client: SupabaseClient,
    public readonly source: string,
    private readonly options: RepositoryOptions<TEntity>,
    private readonly codec: RepositoryStorageCodec<
      TEntity,
      TCreate,
      TUpdate
    > = createObjectStorageCodec((date) => date.toISOString()),
    private readonly idColumn = "id",
  ) {}

  async findAll(): Promise<TEntity[]>;
  async findAll(
    query: SupabaseJsRepositoryQuery<TEntity>,
  ): Promise<PaginatedResult<TEntity>>;
  async findAll(
    query?: SupabaseJsRepositoryQuery<TEntity>,
  ): Promise<TEntity[] | PaginatedResult<TEntity>> {
    if (query === undefined) {
      const entities: TEntity[] = [];
      const batchSize = 1000;
      while (true) {
        const { data, error } = await this.client
          .from(this.source)
          .select("*")
          .order(this.idColumn, { ascending: true })
          .range(entities.length, entities.length + batchSize - 1);
        if (error) throw new RepositoryOperationError("findAll", error);
        if (!data?.length) return entities;
        entities.push(
          ...data.map((record) =>
            this.codec.decode(record as RepositoryRecord),
          ),
        );
      }
    }
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

    const order = query.order?.length
      ? query.order
      : this.options.defaultSort
        ? [{ column: this.options.defaultSort, direction: "desc" as const }]
        : [];
    for (const item of order) {
      const column = this.options.sortFieldMap?.[item.column] ?? item.column;
      request = request.order(column, {
        ascending: item.direction === "asc",
      });
    }

    const { data, error, count } = await request.range(
      from,
      from + query.limit - 1,
    );
    if (error) throw new RepositoryOperationError("findAll", error);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((record) =>
        this.codec.decode(record as RepositoryRecord),
      ),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async create(value: TCreate): Promise<TEntity> {
    const record = this.codec.encodeCreate(value, { now: new Date() });
    const { data, error } = await this.client
      .from(this.source)
      .insert(record)
      .select()
      .single();
    if (error) throw new RepositoryOperationError("create", error);
    return this.codec.decode(data as RepositoryRecord);
  }

  async findOne(id: string): Promise<TEntity> {
    const { data, error } = await this.client
      .from(this.source)
      .select()
      .eq(this.idColumn, id)
      .maybeSingle();
    if (error) throw new RepositoryOperationError("findOne", error);
    if (!data) throw new RepositoryNotFoundError(this.options.entityName, id);
    return this.codec.decode(data as RepositoryRecord);
  }

  async update(id: string, value: TUpdate): Promise<TEntity> {
    await this.findOne(id);
    const record = this.codec.encodeUpdate(value, { id, now: new Date() });
    const { data, error } = await this.client
      .from(this.source)
      .update(record)
      .eq(this.idColumn, id)
      .select()
      .single();
    if (error) throw new RepositoryOperationError("update", error);
    return this.codec.decode(data as RepositoryRecord);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    await this.findOne(id);
    const { error } = await this.client
      .from(this.source)
      .delete()
      .eq(this.idColumn, id);
    if (error) throw new RepositoryOperationError("remove", error);
    return { deleted: true };
  }

  async removeMany(ids: string[]): Promise<BulkDeleteResult> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return { deleted: 0 };
    const { data, error } = await this.client
      .from(this.source)
      .delete()
      .in(this.idColumn, uniqueIds)
      .select(this.idColumn);
    if (error) throw new RepositoryOperationError("removeMany", error);
    return { deleted: data?.length ?? 0 };
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
