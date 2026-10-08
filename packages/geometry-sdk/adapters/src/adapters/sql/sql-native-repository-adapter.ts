import { RepositoryNotFoundError, RepositoryOperationError, RepositoryValidationError } from '../core/errors.js';
import type { BulkDeleteResult, PageableOptions, PaginatedResult } from '../core/api.js';
import { assertEntitySource, hydrateEntity, type EntitySource } from '../core/entity-source.js';
import { isValidPageQuery } from '../utils/is-valid-page-query.js';
import type { SqlNativeConnectionAdapter } from './sql-dialect.js';
import type { SqlFilter, SqlRepositoryAdapterPort, SqlRepositoryQuery } from './types.js';
import { assertSqlReadQuery } from './sql-query.js';

/** Parameterized SQL implementation; source is the table name. */
export class SqlNativeRepositoryAdapter<
  TEntity extends object, TCreate extends object, TUpdate extends object,
> implements SqlRepositoryAdapterPort<TEntity, TCreate, TUpdate> {
  private source: string;
  private mapping: EntitySource<TEntity>;
  private readonly idColumn: string;

  constructor(
    private readonly connection: SqlNativeConnectionAdapter,
    mapping: EntitySource<TEntity>,
    private readonly options: { pageable?: PageableOptions<TEntity> },
    idColumn = 'id',
  ) {
    assertEntitySource(mapping);
    this.mapping = mapping;
    this.source = this.quoteTable(mapping.source);
    this.idColumn = this.quoteIdentifier(idColumn);
  }

  /** Returns the currently selected collection or table. */
  public getSource(): string { return this.mapping.source; }
  /** Selects the collection or table used by subsequent operations. */
  public setSource(source: string): void {
    this.source = this.quoteTable(source);
    this.mapping = { ...this.mapping, source };
  }

  /** Returns every record from the selected source. */
  public findAll(): Promise<TEntity[]> {
    return this.execute(`SELECT * FROM ${this.source}`).then((rows) => rows.map((row) => this.hydrate(row)));
  }

  /** Runs a single read-only SQL SELECT statement. */
  public async query(expression: string): Promise<TEntity[]> {
    assertSqlReadQuery(expression);
    const rows = await this.execute(expression);
    return rows.map((row) => this.hydrate(row));
  }

  /** Returns a page of records using provider-specific filtering and ordering. */
  public async findPage(query: SqlRepositoryQuery<TEntity>): Promise<PaginatedResult<TEntity>> {
    if (!isValidPageQuery(query)) {
      throw new RepositoryValidationError('SQL pagination requires positive integer page and limit values');
    }
    const parameters: unknown[] = [];
    const where = this.filters(query.filters ?? [], parameters);
    const ordering = query.order?.length ? query.order
      : this.options.pageable?.defaultSort
        ? [{ column: this.options.pageable.defaultSort, direction: 'desc' as const }] : [];
    const order = ordering.map(({ column, direction }) => {
      const mapped = this.options.pageable?.sortFieldMap?.[column] ?? column;
      return `${this.quoteIdentifier(mapped)} ${direction === 'asc' ? 'ASC' : 'DESC'}`;
    });
    const [countRows, rows] = await Promise.all([
      this.execute<{ total: string }>(`SELECT COUNT(*) AS total FROM ${this.source}${where}`, parameters),
      this.execute<TEntity>(
        `SELECT * FROM ${this.source}${where}${order.length ? ` ORDER BY ${order.join(', ')}` : ''}` +
        ` LIMIT $${parameters.length + 1} OFFSET $${parameters.length + 2}`,
        [...parameters, query.limit, (query.page - 1) * query.limit],
      ),
    ]);
    return { data: rows.map((row) => this.hydrate(row)), meta: { page: query.page, limit: query.limit, total: Number(countRows[0]?.total ?? 0) } };
  }

  /** Returns a record by ID or raises a not-found error. */
  public async findOne(id: string): Promise<TEntity> {
    const rows = await this.execute(`SELECT * FROM ${this.source} WHERE ${this.idColumn} = $1 LIMIT 1`, [id]);
    if (!rows[0]) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return this.hydrate(rows[0]);
  }

  /** Creates a record and returns its stored representation. */
  public async create(value: TEntity | TCreate): Promise<TEntity> {
    const now = new Date();
    const record = { ...value, createdAt: now, updatedAt: now } as Record<string, unknown>;
    const keys = Object.keys(record);
    const rows = await this.execute(
      `INSERT INTO ${this.source} (${keys.map((key) => this.quoteIdentifier(key)).join(', ')})` +
      ` VALUES (${keys.map((_, index) => `$${index + 1}`).join(', ')}) RETURNING *`,
      keys.map((key) => record[key]),
    );
    return this.hydrate(this.requireRow(rows, 'create'));
  }

  /** Updates a record by ID and returns its current representation. */
  public async update(id: string, value: TUpdate): Promise<TEntity> {
    const record = { ...value, updatedAt: new Date() } as Record<string, unknown>;
    const keys = Object.keys(record);
    const rows = await this.execute(
      `UPDATE ${this.source} SET ${keys.map((key, index) => `${this.quoteIdentifier(key)} = $${index + 1}`).join(', ')}` +
      ` WHERE ${this.idColumn} = $${keys.length + 1} RETURNING *`,
      [...keys.map((key) => record[key]), id],
    );
    if (!rows[0]) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return this.hydrate(rows[0]);
  }

  /** Deletes a record by ID or raises a not-found error. */
  public async remove(id: string): Promise<{ deleted: true }> {
    const rows = await this.execute(`DELETE FROM ${this.source} WHERE ${this.idColumn} = $1 RETURNING ${this.idColumn}`, [id]);
    if (!rows.length) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return { deleted: true };
  }

  /** Deletes the supplied IDs and reports the number removed. */
  public async removeMany(ids: string[]): Promise<BulkDeleteResult> {
    const unique = [...new Set(ids)];
    if (!unique.length) return { deleted: 0 };
    const rows = await this.execute(
      `DELETE FROM ${this.source} WHERE ${this.idColumn} IN (${unique.map((_, index) => `$${index + 1}`).join(', ')}) RETURNING ${this.idColumn}`,
      unique,
    );
    return { deleted: rows.length };
  }

  private filters(filters: readonly SqlFilter<TEntity>[], parameters: unknown[]): string {
    const clauses = filters.map(({ column, operator, value }) => {
      const name = this.quoteIdentifier(column);
      if (operator === 'is') {
        if (value !== null && typeof value !== 'boolean') throw new RepositoryValidationError('SQL is filter accepts only null or boolean values');
        return `${name} IS ${value === null ? 'NULL' : value ? 'TRUE' : 'FALSE'}`;
      }
      if (operator === 'in') {
        const values = Array.isArray(value) ? value : [value];
        if (!values.length) return 'FALSE';
        return `${name} IN (${values.map((item) => { parameters.push(item); return `$${parameters.length}`; }).join(', ')})`;
      }
      const sqlOperator = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', like: 'LIKE', ilike: this.connection.dialect.caseInsensitiveLikeOperator }[operator];
      parameters.push(value);
      return `${name} ${sqlOperator} $${parameters.length}`;
    });
    return clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  }

  private quoteTable(source: string): string { return source.split('.').map((part) => this.quoteIdentifier(part)).join('.'); }

  private hydrate(record: TEntity): TEntity { return hydrateEntity(this.mapping, record); }

  private quoteIdentifier(value: string): string {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new RepositoryValidationError(`Invalid SQL identifier: ${value}`);
    return `"${value}"`;
  }

  private async execute<TResult extends object = TEntity>(statement: string, parameters: unknown[] = []): Promise<TResult[]> {
    try { return await this.connection.query<TResult>(statement, parameters); }
    catch { throw new RepositoryOperationError('SQL native query'); }
  }

  private requireRow(rows: TEntity[], operation: string): TEntity {
    if (!rows[0]) throw new RepositoryOperationError(`${operation} returned no row`);
    return rows[0];
  }
}
