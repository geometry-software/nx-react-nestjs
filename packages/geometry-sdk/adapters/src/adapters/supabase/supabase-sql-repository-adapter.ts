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
import {
  createObjectStorageCodec,
  type RepositoryStorageCodec,
} from "../storage-codec.js";
import type {
  SupabaseFilter,
  SupabaseSqlRepositoryAdapterPort,
  SupabaseSqlRepositoryQuery,
} from "./types.js";

export type SupabaseSqlQueryResult<TRecord extends RepositoryRecord> = {
  rows: TRecord[];
  rowCount: number;
};

/** A minimal SQL transport so the repository is independent of a PostgreSQL driver. */
export interface SupabaseSqlClientAdapter {
  query<TRecord extends RepositoryRecord>(
    statement: string,
    parameters?: readonly unknown[],
  ): Promise<SupabaseSqlQueryResult<TRecord>>;
}

export type SupabaseSqlAdapterOptions<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> = CollectionApiAdapterOptions & {
  client: SupabaseSqlClientAdapter;
  options: RepositoryOptions<TEntity>;
  codec?: RepositoryStorageCodec<TEntity, TCreate, TUpdate>;
  idColumn?: string;
};

export function createSupabaseSqlAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
>(
  options: SupabaseSqlAdapterOptions<TEntity, TCreate, TUpdate>,
): SupabaseSqlRepositoryAdapter<TEntity, TCreate, TUpdate> {
  return new SupabaseSqlRepositoryAdapter(
    options.client,
    options.source,
    options.options,
    options.codec,
    options.idColumn,
  );
}

/** PostgreSQL-style implementation for Supabase direct SQL connections. */
export class SupabaseSqlRepositoryAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> implements SupabaseSqlRepositoryAdapterPort<TEntity, TCreate, TUpdate> {
  private readonly quotedSource: string;
  private readonly quotedIdColumn: string;

  constructor(
    private readonly client: SupabaseSqlClientAdapter,
    public readonly source: string,
    private readonly options: RepositoryOptions<TEntity>,
    private readonly codec: RepositoryStorageCodec<
      TEntity,
      TCreate,
      TUpdate
    > = createObjectStorageCodec((date) => date.toISOString()),
    idColumn = "id",
  ) {
    this.quotedSource = quoteQualifiedIdentifier(source);
    this.quotedIdColumn = quoteIdentifier(idColumn);
  }

  async findAll(): Promise<TEntity[]>;
  async findAll(
    query: SupabaseSqlRepositoryQuery<TEntity>,
  ): Promise<PaginatedResult<TEntity>>;
  async findAll(
    query?: SupabaseSqlRepositoryQuery<TEntity>,
  ): Promise<TEntity[] | PaginatedResult<TEntity>> {
    if (query === undefined) {
      const result = await this.run("findAll", () =>
        this.client.query<RepositoryRecord>(
          `SELECT * FROM ${this.quotedSource} ORDER BY ${this.quotedIdColumn} ASC`,
        ),
      );
      return result.rows.map((record) => this.codec.decode(record));
    }
    if (!isValidPageQuery(query)) {
      throw new RepositoryValidationError(
        "Supabase SQL pagination requires positive integer page and limit values",
      );
    }

    const parameters: unknown[] = [];
    const where = buildWhereClause(query.filters ?? [], parameters);
    const order = this.buildOrderClause(query);
    const offset = (query.page - 1) * query.limit;
    const limitParameter = addParameter(parameters, query.limit);
    const offsetParameter = addParameter(parameters, offset);
    const dataStatement = `SELECT * FROM ${this.quotedSource}${where}${order} LIMIT ${limitParameter} OFFSET ${offsetParameter}`;
    const countParameters = parameters.slice(0, -2);
    const countStatement = `SELECT COUNT(*) AS "total" FROM ${this.quotedSource}${where}`;

    const [dataResult, countResult] = await this.run("findAll", () =>
      Promise.all([
        this.client.query<RepositoryRecord>(dataStatement, parameters),
        this.client.query<{ total: unknown }>(countStatement, countParameters),
      ]),
    );
    const total = Number(countResult.rows[0]?.total ?? 0);
    return {
      data: dataResult.rows.map((record) => this.codec.decode(record)),
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
    const entries = Object.entries(record);
    const parameters = entries.map(([, entryValue]) => entryValue);
    const columns = entries.map(([column]) => quoteIdentifier(column)).join(", ");
    const placeholders = parameters.map((_, index) => `$${index + 1}`).join(", ");
    const statement = entries.length
      ? `INSERT INTO ${this.quotedSource} (${columns}) VALUES (${placeholders}) RETURNING *`
      : `INSERT INTO ${this.quotedSource} DEFAULT VALUES RETURNING *`;
    const result = await this.run("create", () =>
      this.client.query<RepositoryRecord>(statement, parameters),
    );
    return this.codec.decode(requireRow(result.rows, "create"));
  }

  async findOne(id: string): Promise<TEntity> {
    const result = await this.run("findOne", () =>
      this.client.query<RepositoryRecord>(
        `SELECT * FROM ${this.quotedSource} WHERE ${this.quotedIdColumn} = $1 LIMIT 1`,
        [id],
      ),
    );
    const record = result.rows[0];
    if (!record) throw new RepositoryNotFoundError(this.options.entityName, id);
    return this.codec.decode(record);
  }

  async update(id: string, value: TUpdate): Promise<TEntity> {
    await this.findOne(id);
    const record = this.codec.encodeUpdate(value, { id, now: new Date() });
    const entries = Object.entries(record);
    if (entries.length === 0) return this.findOne(id);
    const parameters = entries.map(([, entryValue]) => entryValue);
    parameters.push(id);
    const assignments = entries
      .map(([column], index) => `${quoteIdentifier(column)} = $${index + 1}`)
      .join(", ");
    const result = await this.run("update", () =>
      this.client.query<RepositoryRecord>(
        `UPDATE ${this.quotedSource} SET ${assignments} WHERE ${this.quotedIdColumn} = $${parameters.length} RETURNING *`,
        parameters,
      ),
    );
    return this.codec.decode(requireRow(result.rows, "update"));
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const result = await this.run("remove", () =>
      this.client.query<RepositoryRecord>(
        `DELETE FROM ${this.quotedSource} WHERE ${this.quotedIdColumn} = $1 RETURNING ${this.quotedIdColumn}`,
        [id],
      ),
    );
    if (result.rowCount === 0) {
      throw new RepositoryNotFoundError(this.options.entityName, id);
    }
    return { deleted: true };
  }

  async removeMany(ids: string[]): Promise<BulkDeleteResult> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return { deleted: 0 };
    const placeholders = uniqueIds.map((_, index) => `$${index + 1}`).join(", ");
    const result = await this.run("removeMany", () =>
      this.client.query<RepositoryRecord>(
        `DELETE FROM ${this.quotedSource} WHERE ${this.quotedIdColumn} IN (${placeholders}) RETURNING ${this.quotedIdColumn}`,
        uniqueIds,
      ),
    );
    return { deleted: result.rowCount };
  }

  private buildOrderClause(query: SupabaseSqlRepositoryQuery<TEntity>): string {
    const requestedOrder = query.order?.length
      ? query.order
      : this.options.defaultSort
        ? [{ column: this.options.defaultSort, direction: "desc" as const }]
        : [];
    if (requestedOrder.length === 0) return "";
    const items = requestedOrder.map((item) => {
      const mappedColumn = this.options.sortFieldMap?.[item.column] ?? item.column;
      const direction = item.direction === "asc" ? "ASC" : "DESC";
      return `${quoteIdentifier(mappedColumn)} ${direction}`;
    });
    return ` ORDER BY ${items.join(", ")}`;
  }

  private async run<TResult>(
    operation: string,
    execute: () => Promise<TResult>,
  ): Promise<TResult> {
    try {
      return await execute();
    } catch (error) {
      if (error instanceof RepositoryNotFoundError) throw error;
      throw new RepositoryOperationError(`Supabase SQL ${operation}`, error);
    }
  }
}

function buildWhereClause<TEntity>(
  filters: readonly SupabaseFilter<TEntity>[],
  parameters: unknown[],
): string {
  if (filters.length === 0) return "";
  const clauses = filters.map((filter) => {
    const column = quoteIdentifier(filter.column);
    if (filter.operator === "is") {
      if (filter.value === null) return `${column} IS NULL`;
      if (typeof filter.value === "boolean") {
        return `${column} IS ${filter.value ? "TRUE" : "FALSE"}`;
      }
      throw new RepositoryValidationError(
        "Supabase SQL is filter accepts only null or boolean values",
      );
    }
    if (filter.operator === "in") {
      const values = Array.isArray(filter.value) ? filter.value : [filter.value];
      if (values.length === 0) return "FALSE";
      const placeholders = values.map((value) => addParameter(parameters, value));
      return `${column} IN (${placeholders.join(", ")})`;
    }
    const operators = {
      eq: "=",
      neq: "<>",
      gt: ">",
      gte: ">=",
      lt: "<",
      lte: "<=",
      like: "LIKE",
      ilike: "ILIKE",
    } as const;
    return `${column} ${operators[filter.operator]} ${addParameter(parameters, filter.value)}`;
  });
  return ` WHERE ${clauses.join(" AND ")}`;
}

function addParameter(parameters: unknown[], value: unknown): string {
  parameters.push(value);
  return `$${parameters.length}`;
}

function quoteQualifiedIdentifier(value: string): string {
  return value.split(".").map(quoteIdentifier).join(".");
}

function quoteIdentifier(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new RepositoryValidationError(`Invalid SQL identifier: ${value}`);
  }
  return `"${value}"`;
}

function requireRow<TRecord extends RepositoryRecord>(
  rows: readonly TRecord[],
  operation: string,
): TRecord {
  const row = rows[0];
  if (!row) throw new RepositoryOperationError(`${operation} returned no row`);
  return row;
}
