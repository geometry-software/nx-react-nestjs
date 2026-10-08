import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { SqlNativeRepositoryAdapter } from '../src/adapters/sql/sql-native-repository-adapter.js';
import { SqlOrmRepositoryAdapter } from '../src/adapters/sql/sql-orm-repository-adapter.js';
import type { SqlNativeConnectionAdapter, SqlOrmConnectionAdapter } from '../src/adapters/sql/sql-dialect.js';
import { supabaseSqlProviderDialect } from '../src/adapters/sql/supabase-sql-provider-dialect.js';

class Item {
  id!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
type CreateItem = Pick<Item, 'name'>;
type UpdateItem = Partial<CreateItem>;
const record = { id: 'a', name: 'Alpha', createdAt: new Date(0), updatedAt: new Date(0) };
const mapping = { source: 'public.items', entity: Item };
const options = { pageable: { defaultSort: 'createdAt' as const } };

function native() {
  const query = vi.fn(async (statement: string) => {
    if (statement.includes('COUNT(*)')) return [{ total: '1' }];
    return [record];
  });
  const connection = { implementation: 'native', dialect: supabaseSqlProviderDialect, query } as unknown as SqlNativeConnectionAdapter;
  return {
    adapter: new SqlNativeRepositoryAdapter<Item, CreateItem, UpdateItem>(connection, mapping, options),
    query,
  };
}

function orm() {
  const repository = {
    metadata: { target: Item },
    find: vi.fn().mockResolvedValue([record]),
    findAndCount: vi.fn().mockResolvedValue([[record], 1]),
    findOneBy: vi.fn().mockResolvedValue(record),
    create: vi.fn((value: object) => value),
    save: vi.fn().mockResolvedValue(record),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    delete: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const query = vi.fn().mockResolvedValue([record]);
  const connection = {
    implementation: 'orm', dialect: supabaseSqlProviderDialect,
    dataSource: { query }, repository: vi.fn(() => repository),
  } as unknown as SqlOrmConnectionAdapter;
  return {
    adapter: new SqlOrmRepositoryAdapter<Item, CreateItem, UpdateItem>(
      connection, mapping, options, repository as unknown as Repository<Record<string, unknown>>,
    ),
    query,
  };
}

describe.each([
  { name: 'native SQL', create: native },
  { name: 'TypeORM SQL', create: orm },
])('$name repository public methods', ({ create }) => {
  it('getSource reports the mapped table', () => {
    expect(create().adapter.getSource()).toBe('public.items');
  });

  it('setSource changes the table used by later operations', async () => {
    const { adapter } = create();
    adapter.setSource('public.archive');
    expect(adapter.getSource()).toBe('public.archive');
    await expect(adapter.findAll()).resolves.toHaveLength(1);
  });

  it('findAll returns mapped entities', async () => {
    await expect(create().adapter.findAll()).resolves.toMatchObject([{ id: 'a', name: 'Alpha' }]);
  });

  it('query permits one SELECT and rejects a write statement', async () => {
    const { adapter, query } = create();
    await expect(adapter.query('SELECT * FROM public.items')).resolves.toHaveLength(1);
    expect(query).toHaveBeenCalled();
    await expect(adapter.query('DELETE FROM public.items')).rejects.toThrow('single SELECT');
  });

  it('findPage returns page metadata and rejects invalid limits', async () => {
    const { adapter } = create();
    await expect(adapter.findPage({ page: 1, limit: 2 })).resolves.toMatchObject({
      data: [{ id: 'a' }], meta: { page: 1, limit: 2, total: 1 },
    });
    await expect(adapter.findPage({ page: 1, limit: 0 })).rejects.toThrow('pagination');
  });

  it('findOne returns a mapped record by ID', async () => {
    await expect(create().adapter.findOne('a')).resolves.toMatchObject({ id: 'a', name: 'Alpha' });
  });

  it('create returns the persisted row', async () => {
    await expect(create().adapter.create({ name: 'Alpha' })).resolves.toMatchObject({ id: 'a' });
  });

  it('update returns the current row', async () => {
    await expect(create().adapter.update('a', { name: 'New' })).resolves.toMatchObject({ id: 'a' });
  });

  it('remove reports that one row was deleted', async () => {
    await expect(create().adapter.remove('a')).resolves.toEqual({ deleted: true });
  });

  it('removeMany deduplicates IDs and reports the affected count', async () => {
    await expect(create().adapter.removeMany(['a', 'a'])).resolves.toEqual({ deleted: 1 });
  });
});
