import { ObjectId } from 'mongodb';
import type { MongoRepository } from 'typeorm';
import { RepositoryConflictError, RepositoryNotFoundError } from '../core/errors.js';
import type { PageableCollectionAdapter, PaginatedResult } from '../core/api.js';
import type { MongoCollectionAdapterQuery, MongoDbAdapterModel, MongoDbAdapterOptions } from './mongo-db-native-provider.adapter.js';
import type { MongoDbOrmAdapter } from './mongo-db-orm.adapter.js';
import type { EntitySource } from '../core/entity-source.js';
import { assertOrmRepositoryEntity } from '../shared/orm-entity-mapping.js';
import type { CollectionEntity } from '../core/api.js';
import { fromMongoDocument, toMongoDocument } from './mongo-document-mapping.js';
import { buildMongoPageQuery, isMongoDuplicateKeyError, parseMongoFilter, parseMongoObjectIds } from './mongo-query.js';

/** TypeORM MongoRepository implementation with registered document fields. */
export class MongoDbOrmProviderAdapter<
  TData extends MongoDbAdapterModel,
  TCreate extends object = TData,
  TUpdate extends object = Partial<TCreate>,
> implements PageableCollectionAdapter<
  TData, TUpdate, MongoCollectionAdapterQuery, PaginatedResult<TData>
> {
  private repository: MongoRepository<Record<string, unknown>>;

  constructor(
    private readonly connection: MongoDbOrmAdapter,
    private mapping: EntitySource<CollectionEntity>,
    private readonly options: MongoDbAdapterOptions<TData>,
    repository: MongoRepository<Record<string, unknown>>,
  ) {
    assertOrmRepositoryEntity(mapping, repository);
    this.repository = repository;
  }

  /** Returns the currently selected collection name. */
  public getSource(): string { return this.mapping.source; }

  /** Selects a registered TypeORM MongoDB repository. */
  public setSource(source: string): void {
    const repository = this.connection.repository(source);
    assertOrmRepositoryEntity(this.mapping, repository);
    this.repository = repository;
    this.mapping = { ...this.mapping, source };
  }

  /** Creates a unique collection index through TypeORM. */
  public async ensureUniqueIndex(field: Extract<keyof TData, string>): Promise<void> {
    await this.repository.createCollectionIndex({ [field]: 1 }, { unique: true });
  }

  /** Returns all mapped documents from the selected repository. */
  public async findAll(): Promise<TData[]> {
    return (await this.repository.find()).map((record) => fromMongoDocument<TData>(this.mapping, record));
  }

  /** Applies an Extended JSON filter through the TypeORM Mongo repository. */
  public async query(expression: string): Promise<TData[]> {
    return (await this.repository.findBy(parseMongoFilter(expression)))
      .map((record) => fromMongoDocument<TData>(this.mapping, record));
  }

  /** Applies validated filtering, ordering, and offset pagination. */
  public async findPage(query: MongoCollectionAdapterQuery): Promise<PaginatedResult<TData>> {
    const { filter, sort, direction } = buildMongoPageQuery(query, this.options.pageable);
    const [records, total] = await this.repository.findAndCount({
      where: filter,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [sort]: direction === 1 ? 'ASC' : 'DESC', ...(sort === '_id' ? {} : { _id: direction === 1 ? 'ASC' : 'DESC' }) },
    } as Parameters<MongoRepository<Record<string, unknown>>['findAndCount']>[0]);
    return { data: records.map((record) => fromMongoDocument<TData>(this.mapping, record)), meta: { page: query.page, limit: query.limit, total } };
  }

  /** Finds a mapped document by string ID or raises a not-found error. */
  public async findOne(id: string): Promise<TData> {
    const record = ObjectId.isValid(id)
      ? await this.repository.findOneBy({ _id: new ObjectId(id) }) : null;
    if (!record) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return fromMongoDocument<TData>(this.mapping, record);
  }

  /** Saves a new document with a generated ObjectId and timestamps. */
  public async create(value: TData | TCreate): Promise<TData> {
    const now = new Date();
    const record = this.repository.create({
      ...toMongoDocument({ ...value, createdAt: now, updatedAt: now }), _id: new ObjectId(),
    });
    try { return fromMongoDocument<TData>(this.mapping, await this.repository.save(record)); }
    catch (error) {
      if (isMongoDuplicateKeyError(error)) throw new RepositoryConflictError(`${this.mapping.entity.name} already exists`);
      throw error;
    }
  }

  /** Updates mutable fields and reloads the resulting document. */
  public async update(id: string, value: TUpdate): Promise<TData> {
    if (!ObjectId.isValid(id)) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    const patch = toMongoDocument({ ...value, updatedAt: new Date() });
    delete patch.createdAt;
    try {
      const result = await this.repository.update(new ObjectId(id), patch);
      if (!result.affected) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) throw new RepositoryConflictError(`${this.mapping.entity.name} already exists`);
      throw error;
    }
    return this.findOne(id);
  }

  /** Deletes one document, raising a not-found error when absent. */
  public async remove(id: string): Promise<{ deleted: true }> {
    if (!ObjectId.isValid(id)) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    const result = await this.repository.delete(new ObjectId(id));
    if (!result.affected) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return { deleted: true };
  }

  /** Deletes unique document IDs and reports the affected row count. */
  public async removeMany(ids: string[]): Promise<{ deleted: number }> {
    const objectIds = parseMongoObjectIds(ids);
    if (!objectIds.length) return { deleted: 0 };
    const result = await this.repository.delete(objectIds);
    return { deleted: result.affected ?? 0 };
  }

}
