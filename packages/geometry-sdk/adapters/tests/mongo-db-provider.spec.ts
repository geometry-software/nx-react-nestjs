import { ObjectId } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';
import { MongoDbNativeProviderAdapter } from '../src/adapters/mongodb/mongo-db-native-provider.adapter.js';
import type { MongoDbNativeAdapter } from '../src/adapters/mongodb/mongo-db-native.adapter.js';
import { RepositoryValidationError } from '../src/adapters/core/errors.js';

class Item {
  id!: string;
  name!: string;
  quantity!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
type CreateItem = Pick<Item, 'name' | 'quantity'>;

function setup() {
  const id = new ObjectId();
  const record = { _id: id, name: 'Desk', quantity: 10, createdAt: new Date(), updatedAt: new Date() };
  const cursor = {
    sort: vi.fn().mockReturnThis(), skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(), toArray: vi.fn().mockResolvedValue([record]),
  };
  const collection = {
    createIndex: vi.fn().mockResolvedValue('name_1'), find: vi.fn().mockReturnValue(cursor),
    findOne: vi.fn().mockResolvedValue(record), findOneAndUpdate: vi.fn().mockResolvedValue(record),
    countDocuments: vi.fn().mockResolvedValue(11), insertOne: vi.fn().mockResolvedValue({ insertedId: id }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  };
  const connection = { collection: vi.fn(() => collection) } as unknown as MongoDbNativeAdapter;
  const adapter = new MongoDbNativeProviderAdapter<Item, CreateItem, Partial<CreateItem>>(
    connection, { source: 'items', entity: Item },
    { pageable: { searchableFields: ['name'], sortableFields: ['id', 'name'], defaultSort: 'name' } },
  );
  return { adapter, collection, connection, cursor, id, record };
}

describe('MongoDbNativeProviderAdapter public methods', () => {
  it('getSource returns the selected collection', () => {
    expect(setup().adapter.getSource()).toBe('items');
  });

  it('setSource switches subsequent reads to the requested collection', async () => {
    const { adapter, connection } = setup();
    adapter.setSource('archive');
    await adapter.findAll();
    expect(adapter.getSource()).toBe('archive');
    expect(connection.collection).toHaveBeenCalledWith('archive');
  });

  it('ensureUniqueIndex creates a unique index for the selected field', async () => {
    const { adapter, collection } = setup();
    await adapter.ensureUniqueIndex('name');
    expect(collection.createIndex).toHaveBeenCalledWith({ name: 1 }, { unique: true });
  });

  it('findAll maps native ObjectIds to string IDs', async () => {
    const { adapter, id } = setup();
    await expect(adapter.findAll()).resolves.toMatchObject([{ id: id.toHexString(), name: 'Desk' }]);
  });

  it('query parses Extended JSON and rejects malformed expressions', async () => {
    const { adapter, collection } = setup();
    await adapter.query('{"name":"Desk"}');
    expect(collection.find).toHaveBeenCalledWith({ name: 'Desk' });
    await expect(adapter.query('[')).rejects.toBeInstanceOf(RepositoryValidationError);
  });

  it('findPage escapes search text and applies stable ordering and offsets', async () => {
    const { adapter, collection, cursor } = setup();
    const result = await adapter.findPage({ page: 2, limit: 5, search: 'a.b', sort: 'name', order: 'asc' });
    expect(collection.find).toHaveBeenCalledWith({ $or: [{ name: { $regex: 'a\\.b', $options: 'i' } }] });
    expect(cursor.sort).toHaveBeenCalledWith({ name: 1, _id: 1 });
    expect(cursor.skip).toHaveBeenCalledWith(5);
    expect(result.meta).toEqual({ page: 2, limit: 5, total: 11 });
  });

  it('findOne maps a record and reports an invalid ID as missing', async () => {
    const { adapter, id } = setup();
    await expect(adapter.findOne(id.toHexString())).resolves.toMatchObject({ id: id.toHexString() });
    await expect(adapter.findOne('invalid')).rejects.toThrow('not found');
  });

  it('create stores timestamps and a native ID without exposing _id', async () => {
    const { adapter, collection } = setup();
    const item = await adapter.create({ name: 'Table', quantity: 4 });
    const stored = collection.insertOne.mock.calls[0][0];
    expect(stored._id).toBeInstanceOf(ObjectId);
    expect(stored).not.toHaveProperty('id');
    expect(item.id).toBe(stored._id.toHexString());
    expect(item.createdAt).toBeInstanceOf(Date);
  });

  it('update omits immutable and undefined fields', async () => {
    const { adapter, collection, id } = setup();
    await adapter.update(id.toHexString(), { name: undefined, quantity: 5, id: 'wrong' } as Partial<CreateItem>);
    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: id }, { $set: { quantity: 5, updatedAt: expect.any(Date) } }, { returnDocument: 'after' },
    );
  });

  it('remove deletes one existing document and reports missing documents', async () => {
    const { adapter, collection, id } = setup();
    await expect(adapter.remove(id.toHexString())).resolves.toEqual({ deleted: true });
    collection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });
    await expect(adapter.remove(id.toHexString())).rejects.toThrow('not found');
  });

  it('removeMany deduplicates IDs and rejects malformed IDs', async () => {
    const { adapter, collection, id } = setup();
    await expect(adapter.removeMany([id.toHexString(), id.toHexString()])).resolves.toEqual({ deleted: 1 });
    expect(collection.deleteMany.mock.calls[0][0]._id.$in).toHaveLength(1);
    await expect(adapter.removeMany(['invalid'])).rejects.toBeInstanceOf(RepositoryValidationError);
  });
});
