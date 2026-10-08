import { ObjectId } from 'mongodb';
import type { MongoRepository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import { MongoDbOrmProviderAdapter } from '../src/adapters/mongodb/mongo-db-orm-provider.adapter.js';
import type { MongoDbOrmAdapter } from '../src/adapters/mongodb/mongo-db-orm.adapter.js';
import { RepositoryValidationError } from '../src/adapters/core/errors.js';

class Item {
  id!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
type CreateItem = Pick<Item, 'name'>;

function setup() {
  const id = new ObjectId();
  const record = { _id: id, name: 'Desk', createdAt: new Date(0), updatedAt: new Date(0) };
  const repository = {
    metadata: { target: Item },
    createCollectionIndex: vi.fn().mockResolvedValue('name_1'),
    find: vi.fn().mockResolvedValue([record]),
    findBy: vi.fn().mockResolvedValue([record]),
    findAndCount: vi.fn().mockResolvedValue([[record], 1]),
    findOneBy: vi.fn().mockResolvedValue(record),
    create: vi.fn((value: object) => value),
    save: vi.fn().mockResolvedValue(record),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    delete: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const connection = { repository: vi.fn(() => repository) } as unknown as MongoDbOrmAdapter;
  const adapter = new MongoDbOrmProviderAdapter<Item, CreateItem, Partial<CreateItem>>(
    connection,
    { source: 'items', entity: Item },
    { pageable: { searchableFields: ['name'], sortableFields: ['name'], defaultSort: 'name' } },
    repository as unknown as MongoRepository<Record<string, unknown>>,
  );
  return { adapter, connection, repository, id, record };
}

describe('MongoDbOrmProviderAdapter public methods', () => {
  it('getSource reports the selected collection', () => {
    expect(setup().adapter.getSource()).toBe('items');
  });

  it('setSource selects a registered repository for subsequent reads', async () => {
    const { adapter, connection } = setup();
    adapter.setSource('archive');
    await adapter.findAll();
    expect(adapter.getSource()).toBe('archive');
    expect(connection.repository).toHaveBeenCalledWith('archive');
  });

  it('ensureUniqueIndex creates a unique index through TypeORM', async () => {
    const { adapter, repository } = setup();
    await adapter.ensureUniqueIndex('name');
    expect(repository.createCollectionIndex).toHaveBeenCalledWith({ name: 1 }, { unique: true });
  });

  it('findAll maps native IDs to strings', async () => {
    const { adapter, id } = setup();
    await expect(adapter.findAll()).resolves.toMatchObject([{ id: id.toHexString() }]);
  });

  it('query parses Extended JSON and rejects malformed filters', async () => {
    const { adapter, repository } = setup();
    await adapter.query('{"name":"Desk"}');
    expect(repository.findBy).toHaveBeenCalledWith({ name: 'Desk' });
    await expect(adapter.query('[')).rejects.toBeInstanceOf(RepositoryValidationError);
  });

  it('findPage applies search, ordering, and offsets', async () => {
    const { adapter, repository } = setup();
    const result = await adapter.findPage({ page: 2, limit: 2, search: 'D.s', sort: 'name', order: 'asc' });
    expect(repository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
      skip: 2, take: 2, order: { name: 'ASC', _id: 'ASC' },
      where: { $or: [{ name: { $regex: 'D\\.s', $options: 'i' } }] },
    }));
    expect(result.meta).toEqual({ page: 2, limit: 2, total: 1 });
  });

  it('findOne finds a mapped document by string ID', async () => {
    const { adapter, id } = setup();
    await expect(adapter.findOne(id.toHexString())).resolves.toMatchObject({ id: id.toHexString() });
  });

  it('create saves a generated ID and timestamps', async () => {
    const { adapter, repository } = setup();
    await adapter.create({ name: 'Table' });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      _id: expect.any(ObjectId), createdAt: expect.any(Date), updatedAt: expect.any(Date),
    }));
  });

  it('update writes mutable fields and reloads the row', async () => {
    const { adapter, repository, id } = setup();
    await expect(adapter.update(id.toHexString(), { name: 'New' })).resolves.toMatchObject({ id: id.toHexString() });
    expect(repository.update).toHaveBeenCalledWith(id, expect.objectContaining({ name: 'New', updatedAt: expect.any(Date) }));
  });

  it('remove deletes one document', async () => {
    const { adapter, repository, id } = setup();
    await expect(adapter.remove(id.toHexString())).resolves.toEqual({ deleted: true });
    expect(repository.delete).toHaveBeenCalledWith(id);
  });

  it('removeMany deduplicates and validates IDs', async () => {
    const { adapter, repository, id } = setup();
    await expect(adapter.removeMany([id.toHexString(), id.toHexString()])).resolves.toEqual({ deleted: 1 });
    expect(repository.delete.mock.calls[0][0]).toHaveLength(1);
    await expect(adapter.removeMany(['invalid'])).rejects.toBeInstanceOf(RepositoryValidationError);
  });
});
