import { Logger } from '@nestjs/common';
import {
  And, Equal, ILike, In, IsNull, LessThan, LessThanOrEqual, Like,
  MoreThan, MoreThanOrEqual, Not, type FindOperator, type FindOptionsWhere, type Repository,
} from 'typeorm';
import { RepositoryNotFoundError, RepositoryOperationError, RepositoryValidationError } from '../core/errors.js';
import type { BulkDeleteResult, PageableOptions, PaginatedResult } from '../core/api.js';
import { hydrateEntity, type EntitySource } from '../core/entity-source.js';
import { assertOrmRepositoryEntity } from '../shared/orm-entity-mapping.js';
import { SqlOrmOperation } from '../shared/sql-orm-operation.js';
import { isValidPageQuery } from '../utils/is-valid-page-query.js';
import type { SqlOrmConnectionAdapter } from './sql-dialect.js';
import type { SqlFilter, SqlRepositoryAdapterPort, SqlRepositoryQuery } from './types.js';
import { assertSqlReadQuery } from './sql-query.js';

/** TypeORM Repository implementation for a registered SQL table. */
export class SqlOrmRepositoryAdapter<
  TEntity extends object, TCreate extends object, TUpdate extends object,
> implements SqlRepositoryAdapterPort<TEntity, TCreate, TUpdate> {
  private readonly logger = new Logger(SqlOrmRepositoryAdapter.name);
  private repository: Repository<Record<string, unknown>>;

  constructor(
    private readonly connection: SqlOrmConnectionAdapter,
    private mapping: EntitySource<TEntity>,
    private readonly options: { pageable?: PageableOptions<TEntity> },
    repository: Repository<Record<string, unknown>>,
    private readonly idColumn = 'id',
  ) {
    assertOrmRepositoryEntity(mapping, repository);
    this.repository = repository;
  }

  /** Returns the currently selected collection or table. */
  public getSource(): string { return this.mapping.source; }

  /** Selects the collection or table used by subsequent operations. */
  public setSource(source: string): void {
    const repository = this.connection.repository(source);
    assertOrmRepositoryEntity(this.mapping, repository);
    this.repository = repository;
    this.mapping = { ...this.mapping, source };
  }

  /** Returns every record from the selected source. */
  public async findAll(): Promise<TEntity[]> {
    return (await this.run(SqlOrmOperation.FindAll, () => this.repository.find())).map((record) => this.decode(record));
  }

  /** Runs a single read-only SQL SELECT statement through TypeORM. */
  public async query(expression: string): Promise<TEntity[]> {
    assertSqlReadQuery(expression);
    const rows = await this.run(SqlOrmOperation.Query, () => this.connection.dataSource.query<Record<string, unknown>[]>(expression));
    return rows.map((record) => this.decode(record));
  }

  /** Returns a page of records using provider-specific filtering and ordering. */
  public async findPage(query: SqlRepositoryQuery<TEntity>): Promise<PaginatedResult<TEntity>> {
    if (!isValidPageQuery(query)) {
      throw new RepositoryValidationError('SQL pagination requires positive integer page and limit values');
    }
    const where = this.filters(query.filters ?? []);
    const requestedOrder = query.order?.length ? query.order
      : this.options.pageable?.defaultSort
        ? [{ column: this.options.pageable.defaultSort, direction: 'desc' as const }] : [];
    const order = Object.fromEntries(requestedOrder.map(({ column, direction }) => [
      this.options.pageable?.sortFieldMap?.[column] ?? column,
      direction === 'asc' ? 'ASC' : 'DESC',
    ]));
    const [records, total] = await this.run(SqlOrmOperation.FindPage, () => this.repository.findAndCount({
      where: where as FindOptionsWhere<Record<string, unknown>>,
      order,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }));
    return { data: records.map((record) => this.decode(record)), meta: { page: query.page, limit: query.limit, total } };
  }

  /** Returns a record by ID or raises a not-found error. */
  public async findOne(id: string): Promise<TEntity> {
    const record = await this.run(SqlOrmOperation.FindOne, () => this.repository.findOneBy({ [this.idColumn]: id }));
    if (!record) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return this.decode(record);
  }

  /** Creates a record and returns its stored representation. */
  public async create(value: TEntity | TCreate): Promise<TEntity> {
    const now = new Date();
    const entity = this.repository.create({ ...value, createdAt: now, updatedAt: now });
    return this.decode(await this.run(SqlOrmOperation.Create, () => this.repository.save(entity)));
  }

  /** Updates a record by ID and returns its current representation. */
  public async update(id: string, value: TUpdate): Promise<TEntity> {
    const result = await this.run(SqlOrmOperation.Update, () => this.repository.update(
      { [this.idColumn]: id }, { ...value, updatedAt: new Date() },
    ));
    if (!result.affected) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return this.findOne(id);
  }

  /** Deletes a record by ID or raises a not-found error. */
  public async remove(id: string): Promise<{ deleted: true }> {
    const result = await this.run(SqlOrmOperation.Remove, () => this.repository.delete({ [this.idColumn]: id }));
    if (!result.affected) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return { deleted: true };
  }

  /** Deletes the supplied IDs and reports the number removed. */
  public async removeMany(ids: string[]): Promise<BulkDeleteResult> {
    const unique = [...new Set(ids)];
    if (!unique.length) return { deleted: 0 };
    const result = await this.run(SqlOrmOperation.RemoveMany, () => this.repository.delete({ [this.idColumn]: In(unique) }));
    return { deleted: result.affected ?? 0 };
  }

  private filters(filters: readonly SqlFilter<TEntity>[]): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    for (const { column, operator, value } of filters) {
      const predicate = this.predicate(operator, value);
      where[column] = column in where ? And(where[column] as FindOperator<unknown>, predicate) : predicate;
    }
    return where;
  }

  private predicate(operator: SqlFilter<TEntity>['operator'], value: unknown): FindOperator<unknown> {
    switch (operator) {
      case 'eq': return Equal(value);
      case 'neq': return Not(value);
      case 'gt': return MoreThan(value);
      case 'gte': return MoreThanOrEqual(value);
      case 'lt': return LessThan(value);
      case 'lte': return LessThanOrEqual(value);
      case 'like': return Like(String(value));
      case 'ilike': return ILike(String(value));
      case 'in': return In(Array.isArray(value) ? value : [value]);
      case 'is':
        if (value === null) return IsNull();
        if (typeof value === 'boolean') return Equal(value);
        throw new RepositoryValidationError('SQL is filter accepts only null or boolean values');
    }
  }

  private decode(record: Record<string, unknown>): TEntity { return hydrateEntity(this.mapping, record); }

  private async run<TResult>(operation: SqlOrmOperation, execute: () => Promise<TResult>): Promise<TResult> {
    try { return await execute(); }
    catch (error) {
      this.logger.error(`SQL ORM ${operation} failed`, error instanceof Error ? error.stack : String(error));
      throw new RepositoryOperationError(`SQL ORM ${operation}`);
    }
  }
}
