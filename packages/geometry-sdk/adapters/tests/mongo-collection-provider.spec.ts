import { ObjectId } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';
import { MongoCollectionProviderAdapter } from '../src/adapters/mongodb/mongo-collection-provider.adapter.js';
import type { MongoProviderConnection } from '../src/adapters/mongodb/mongo-provider.connection.js';
import type { RepositoryEntity } from '../src/adapters/core/types.js';
import { RepositoryQuery } from '../src/adapters/core/query.js';
import { RepositoryValidationError } from '../src/adapters/core/errors.js';

type Item = RepositoryEntity & { name: string; quantity: number };
type CreateItem = { name: string; quantity: number };

function setup() {
  const id = new ObjectId();
  const record = { _id: id, name: 'Desk', quantity: 10, createdAt: new Date(), updatedAt: new Date() };
  const cursor = {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue([record]),
  };
  const collection = {
    find: vi.fn().mockReturnValue(cursor),
    findOne: vi.fn().mockResolvedValue(record),
    findOneAndUpdate: vi.fn().mockResolvedValue(record),
    countDocuments: vi.fn().mockResolvedValue(11),
    insertOne: vi.fn().mockResolvedValue({ insertedId: id }),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  };
  const connection = { collection: () => collection } as unknown as MongoProviderConnection;
  const adapter = new MongoCollectionProviderAdapter<Item, CreateItem, Partial<CreateItem>>(
    connection, 'items', {
      entityName: 'Item', searchableFields: ['name'],
      sortableFields: ['id', 'name'], defaultSort: 'name',
    },
  );
  return { adapter, collection, cursor, record, id };
}

describe('MongoCollectionProviderAdapter', () => {
  it('exposes existing Mongo IDs as strings without exposing _id', async () => {
    const { adapter, record, id } = setup();
    const item = await adapter.findOne(id.toHexString());
    expect(item).toEqual({ name: 'Desk', quantity: 10, createdAt: record.createdAt, updatedAt: record.updatedAt, id: id.toHexString() });
    expect(item).not.toHaveProperty('_id');
  });

  it('sets timestamps and stores a native ID when creating records', async () => {
    const { adapter, collection } = setup();
    const item = await adapter.create({ name: 'Table', quantity: 4 });
    const stored = collection.insertOne.mock.calls[0][0];
    expect(stored._id).toBeInstanceOf(ObjectId);
    expect(stored).not.toHaveProperty('id');
    expect(item.id).toBe(stored._id.toHexString());
    expect(item.createdAt).toBeInstanceOf(Date);
    expect(item.updatedAt).toEqual(item.createdAt);
  });

  it('preserves immutable fields and omits undefined updates', async () => {
    const { adapter, collection, id } = setup();
    const patch = { name: undefined, quantity: 5, id: 'replacement', _id: 'replacement', createdAt: new Date(0) };
    await adapter.update(id.toHexString(), patch);
    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: id }, { $set: { quantity: 5, updatedAt: expect.any(Date) } },
      { returnDocument: 'after' },
    );
  });

  it('uses stable ordering and literal search for paginated results', async () => {
    const { adapter, collection, cursor } = setup();
    const result = await adapter.findPage(new RepositoryQuery({ page: 2, limit: 5, search: 'a.b', sort: 'name', order: 'asc' }));
    expect(collection.find).toHaveBeenCalledWith({ $or: [{ name: { $regex: 'a\\.b', $options: 'i' } }] });
    expect(cursor.sort).toHaveBeenCalledWith({ name: 1, _id: 1 });
    expect(cursor.skip).toHaveBeenCalledWith(5);
    expect(result.meta).toEqual({ page: 2, limit: 5, total: 11, totalPages: 3 });
  });

  it('rejects invalid pagination and bulk IDs before issuing queries', async () => {
    const { adapter, collection } = setup();
    await expect(adapter.findPage(new RepositoryQuery({ limit: 0 }))).rejects.toBeInstanceOf(RepositoryValidationError);
    await expect(adapter.removeMany(['invalid'])).rejects.toBeInstanceOf(RepositoryValidationError);
    await expect(adapter.findByIds(['invalid'])).rejects.toBeInstanceOf(RepositoryValidationError);
    expect(collection.find).not.toHaveBeenCalled();
    expect(collection.deleteMany).not.toHaveBeenCalled();
  });
});
