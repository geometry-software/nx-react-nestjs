import { ObjectId, type Document } from 'mongodb';
import { PageableCollection } from '../core/pageable.js';
import { RepositoryNotFoundError, RepositoryValidationError } from '../core/errors.js';
import { isValidPageQuery, type RepositoryQuery } from '../core/query.js';
import type { PaginatedResult, RepositoryEntity, RepositoryOptions } from '../core/types.js';
import { createObjectStorageCodec, type RepositoryStorageCodec } from '../storage-codec.js';
import type { MongoProviderConnection } from './mongo-provider.connection.js';

export type MongoCollectionProviderModel = RepositoryEntity;
export type MongoCollectionProviderQuery = RepositoryQuery;

/** Native Mongo collection implementation. ObjectId never crosses this boundary. */
export class MongoCollectionProviderAdapter<
  TData extends MongoCollectionProviderModel,
  TCreate extends object = TData,
  TUpdate extends object = Partial<TCreate>,
> extends PageableCollection<
  TData, TCreate, TUpdate, MongoCollectionProviderQuery, PaginatedResult<TData>
> {
  constructor(
    private readonly connection: MongoProviderConnection,
    public readonly source: string,
    private readonly options: RepositoryOptions<TData>,
    private readonly codec: RepositoryStorageCodec<TData, TCreate, TUpdate> = createObjectStorageCodec(),
  ) {
    super();
  }

  private get collection() {
    return this.connection.collection(this.source);
  }

  protected async findRecords(): Promise<TData[]> {
    const records = await this.collection.find({}).toArray();
    return records.map((record) => this.decode(record));
  }

  async findPage(query: MongoCollectionProviderQuery): Promise<PaginatedResult<TData>> {
    if (!isValidPageQuery(query)) {
      throw new RepositoryValidationError('Pagination requires positive integer page and limit values');
    }
    const search = query.search?.trim();
    const filter = search && this.options.searchableFields.length
      ? { $or: this.options.searchableFields.map((field) => ({
          [field]: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
        })) }
      : {};
    const requestedSort = this.options.sortableFields.includes(query.sort as Extract<keyof TData, string>)
      ? query.sort
      : (this.options.defaultSort ?? 'createdAt');
    const sort = requestedSort === 'id' ? '_id' : (this.options.sortFieldMap?.[requestedSort] ?? requestedSort);
    const direction = query.order === 'asc' ? 1 : -1;
    const [records, total] = await Promise.all([
      this.collection.find(filter)
        .sort({ [sort]: direction, ...(sort === '_id' ? {} : { _id: direction }) })
        .skip((query.page - 1) * query.limit).limit(query.limit).toArray(),
      this.collection.countDocuments(filter),
    ]);
    return {
      data: records.map((record) => this.decode(record)),
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) },
    };
  }

  async findOne(id: string): Promise<TData> {
    const record = ObjectId.isValid(id) ? await this.collection.findOne({ _id: new ObjectId(id) }) : null;
    if (!record) throw new RepositoryNotFoundError(this.options.entityName, id);
    return this.decode(record);
  }

  async findByIds(ids: string[]): Promise<TData[]> {
    const objectIds = this.parseIds(ids);
    if (!objectIds.length) return [];
    const records = await this.collection.find({ _id: { $in: objectIds } }).toArray();
    return records.map((record) => this.decode(record));
  }

  async create(value: TCreate): Promise<TData> {
    const _id = new ObjectId();
    const record = { ...this.writable(this.codec.encodeCreate(value, { id: _id.toHexString(), now: new Date() })), _id };
    await this.collection.insertOne(record);
    return this.decode(record);
  }

  async update(id: string, value: TUpdate): Promise<TData> {
    if (!ObjectId.isValid(id)) throw new RepositoryNotFoundError(this.options.entityName, id);
    const patch = this.writable(this.codec.encodeUpdate(value, { id, now: new Date() }));
    delete patch.createdAt;
    const record = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) }, { $set: patch }, { returnDocument: 'after' },
    );
    if (!record) throw new RepositoryNotFoundError(this.options.entityName, id);
    return this.decode(record);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    if (!ObjectId.isValid(id)) throw new RepositoryNotFoundError(this.options.entityName, id);
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) throw new RepositoryNotFoundError(this.options.entityName, id);
    return { deleted: true };
  }

  async removeMany(ids: string[]): Promise<{ deleted: number }> {
    const objectIds = this.parseIds(ids);
    if (!objectIds.length) return { deleted: 0 };
    const result = await this.collection.deleteMany({ _id: { $in: objectIds } });
    return { deleted: result.deletedCount };
  }

  private parseIds(ids: string[]): ObjectId[] {
    if (ids.some((id) => !ObjectId.isValid(id))) {
      throw new RepositoryValidationError('One or more entity ids are invalid');
    }
    return [...new Set(ids)].map((id) => new ObjectId(id));
  }

  private writable(record: Document): Document {
    return Object.fromEntries(Object.entries(record).filter(([key, value]) => key !== 'id' && key !== '_id' && value !== undefined));
  }

  private decode(document: Document): TData {
    const { _id, ...record } = document;
    return this.codec.decode(record, String(_id));
  }
}
