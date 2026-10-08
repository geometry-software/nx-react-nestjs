import { ObjectId, type Document } from 'mongodb';
import { RepositoryConflictError, RepositoryNotFoundError } from '../core/errors.js';
import type { PageableCollectionAdapter, PageableOptions, PaginatedResult, CollectionEntity, PageableCollectionQuery } from '../core/api.js';
import type { MongoDbNativeAdapter } from './mongo-db-native.adapter.js';
import { assertEntitySource, type EntitySource } from '../core/entity-source.js';
import { fromMongoDocument, toMongoDocument } from './mongo-document-mapping.js';
import { buildMongoPageQuery, isMongoDuplicateKeyError, parseMongoFilter, parseMongoObjectIds } from './mongo-query.js';

export type MongoDbAdapterModel = CollectionEntity;
export type MongoCollectionAdapterQuery = PageableCollectionQuery & {
  filter?: Readonly<Record<string, unknown>>;
};

export type MongoDbAdapterOptions<TData> = {
  pageable: PageableOptions<TData>;
};

/** Native MongoDB Collection implementation. ObjectId never crosses this boundary. */
export class MongoDbNativeProviderAdapter<
  TData extends MongoDbAdapterModel,
  TCreate extends object = TData,
  TUpdate extends object = Partial<TCreate>,
> implements PageableCollectionAdapter<
  TData, TUpdate, MongoCollectionAdapterQuery, PaginatedResult<TData>
> {
  constructor(
    private readonly connection: MongoDbNativeAdapter,
    private mapping: EntitySource<CollectionEntity>,
    private readonly options: MongoDbAdapterOptions<TData>,
  ) {
    assertEntitySource(mapping);
  }

  /** Returns the currently selected collection name. */
  public getSource(): string {
    return this.mapping.source;
  }

  /** Selects a registered collection for subsequent operations. */
  public setSource(source: string): void {
    this.connection.collection(source);
    this.mapping = { ...this.mapping, source };
  }

  private get collection() {
    return this.connection.collection(this.mapping.source);
  }

  /** Creates a unique index for a document field. */
  public async ensureUniqueIndex(field: Extract<keyof TData, string>): Promise<void> {
    await this.collection.createIndex({ [field]: 1 as const }, { unique: true });
  }

  /** Returns every document from the selected collection. */
  public async findAll(): Promise<TData[]> {
    const records = await this.collection.find({}).toArray();
    return records.map((record) => fromMongoDocument<TData>(this.mapping, record));
  }

  /** Executes an Extended JSON MongoDB filter against the selected collection. */
  public async query(expression: string): Promise<TData[]> {
    const records = await this.collection.find(parseMongoFilter(expression)).toArray();
    return records.map((record) => fromMongoDocument<TData>(this.mapping, record));
  }

  /** Applies validated search, filtering, sorting, and offset pagination. */
  public async findPage(query: MongoCollectionAdapterQuery): Promise<PaginatedResult<TData>> {
    const { filter, sort, direction } = buildMongoPageQuery(query, this.options.pageable);
    const [records, total] = await Promise.all([
      this.collection.find(filter)
        .sort({ [sort]: direction, ...(sort === '_id' ? {} : { _id: direction }) })
        .skip((query.page - 1) * query.limit).limit(query.limit).toArray(),
      this.collection.countDocuments(filter),
    ]);
    return {
      data: records.map((record) => fromMongoDocument<TData>(this.mapping, record)),
      meta: { page: query.page, limit: query.limit, total },
    };
  }

  /** Finds a document by its string ID or raises a not-found error. */
  public async findOne(id: string): Promise<TData> {
    const record = ObjectId.isValid(id)
      ? await this.collection.findOne({ _id: new ObjectId(id) })
      : null;
    if (!record) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return fromMongoDocument<TData>(this.mapping, record);
  }

  /** Inserts a document with a generated ObjectId and timestamps. */
  public async create(value: TData | TCreate): Promise<TData> {
    const _id = new ObjectId();
    const now = new Date();
    const record = { ...toMongoDocument({ ...value, createdAt: now, updatedAt: now }), _id };
    try {
      await this.collection.insertOne(record);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new RepositoryConflictError(`${this.mapping.entity.name} already exists`);
      }
      throw error;
    }
    return fromMongoDocument<TData>(this.mapping, record);
  }

  /** Updates mutable fields and returns the resulting document. */
  public async update(id: string, value: TUpdate): Promise<TData> {
    if (!ObjectId.isValid(id)) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    const patch = toMongoDocument({ ...value, updatedAt: new Date() });
    delete patch.createdAt;
    let record: Document | null;
    try {
      record = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) }, { $set: patch }, { returnDocument: 'after' },
      );
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new RepositoryConflictError(`${this.mapping.entity.name} already exists`);
      }
      throw error;
    }
    if (!record) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return fromMongoDocument<TData>(this.mapping, record);
  }

  /** Deletes one document, raising a not-found error when absent. */
  public async remove(id: string): Promise<{ deleted: true }> {
    if (!ObjectId.isValid(id)) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) throw new RepositoryNotFoundError(this.mapping.entity.name, id);
    return { deleted: true };
  }

  /** Deletes unique document IDs and returns the number actually removed. */
  public async removeMany(ids: string[]): Promise<{ deleted: number }> {
    const objectIds = parseMongoObjectIds(ids);
    if (!objectIds.length) return { deleted: 0 };
    const result = await this.collection.deleteMany({ _id: { $in: objectIds } });
    return { deleted: result.deletedCount };
  }

}
