import { MongoClient } from 'mongodb';
import { Pool } from 'pg';
import { DataSource } from 'typeorm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MongoDbNativeAdapter } from '../src/adapters/mongodb/mongo-db-native.adapter.js';
import { MongoDbOrmAdapter } from '../src/adapters/mongodb/mongo-db-orm.adapter.js';
import { SqlNativePoolAdapter } from '../src/adapters/sql/sql-native-pool.adapter.js';
import { SqlOrmDataSourceAdapter } from '../src/adapters/sql/sql-orm-data-source.adapter.js';
import { RepositoryValidationError } from '../src/adapters/core/errors.js';

afterEach(() => vi.restoreAllMocks());

class Item {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

const mongoConfiguration = {
  provider: 'mongo' as const, dialect: 'mongodb-ejson' as const,
  connectionString: 'mongodb://localhost:27017/test',
};

describe('MongoDbNativeAdapter public methods', () => {
  it('connect opens its MongoClient', async () => {
    const connect = vi.spyOn(MongoClient.prototype, 'connect').mockResolvedValue({} as never);
    const adapter = new MongoDbNativeAdapter(mongoConfiguration, ['items']);
    await adapter.connect();
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('collection rejects unregistered names before requesting a collection', () => {
    const adapter = new MongoDbNativeAdapter(mongoConfiguration, ['items']);
    expect(() => adapter.collection('unknown')).toThrow(RepositoryValidationError);
  });

  it('onApplicationShutdown closes its MongoClient', async () => {
    const close = vi.spyOn(MongoClient.prototype, 'close').mockResolvedValue(undefined);
    const adapter = new MongoDbNativeAdapter(mongoConfiguration, ['items']);
    await adapter.onApplicationShutdown();
    expect(close).toHaveBeenCalledTimes(1);
  });
});

describe('MongoDbOrmAdapter public methods', () => {
  function adapter() {
    return new MongoDbOrmAdapter(mongoConfiguration, [{
      mapping: { source: 'items', entity: Item },
      orm: { columns: { _id: { type: 'objectId', objectId: true }, id: { type: 'text' } } },
    }]);
  }

  it('connect initializes the TypeORM data source', async () => {
    const initialize = vi.spyOn(DataSource.prototype, 'initialize').mockResolvedValue({} as never);
    await adapter().connect();
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('repository rejects a source that was not registered', () => {
    expect(() => adapter().repository('unknown')).toThrow(RepositoryValidationError);
  });

  it('onApplicationShutdown destroys an initialized data source', async () => {
    const destroy = vi.spyOn(DataSource.prototype, 'destroy').mockResolvedValue(undefined);
    const instance = adapter();
    Object.defineProperty((instance as unknown as { dataSource: DataSource }).dataSource, 'isInitialized', { value: true });
    await instance.onApplicationShutdown();
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});

describe('SqlNativePoolAdapter public methods', () => {
  it('open obtains and releases a PostgreSQL client', async () => {
    const release = vi.fn();
    const connect = vi.spyOn(Pool.prototype, 'connect').mockResolvedValue({ release } as never);
    await SqlNativePoolAdapter.open('postgresql://localhost/test');
    expect(connect).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('query passes bound parameters and returns rows', async () => {
    vi.spyOn(Pool.prototype, 'connect').mockResolvedValue({ release: vi.fn() } as never);
    const query = vi.spyOn(Pool.prototype, 'query').mockResolvedValue({ rows: [{ id: 'a' }] } as never);
    const adapter = await SqlNativePoolAdapter.open('postgresql://localhost/test');
    await expect(adapter.query('SELECT $1 AS id', ['a'])).resolves.toEqual([{ id: 'a' }]);
    expect(query).toHaveBeenCalledWith('SELECT $1 AS id', ['a']);
  });

  it('onApplicationShutdown drains the pool', async () => {
    vi.spyOn(Pool.prototype, 'connect').mockResolvedValue({ release: vi.fn() } as never);
    const end = vi.spyOn(Pool.prototype, 'end').mockResolvedValue(undefined);
    const adapter = await SqlNativePoolAdapter.open('postgresql://localhost/test');
    await adapter.onApplicationShutdown();
    expect(end).toHaveBeenCalledTimes(1);
  });
});

describe('SqlOrmDataSourceAdapter public methods', () => {
  const tables = [{
    source: 'public.items', entity: Item,
    orm: { columns: { id: { type: 'uuid' as const, primary: true }, createdAt: { type: 'timestamptz' as const } } },
  }];

  it('open initializes TypeORM with registered table metadata', async () => {
    const initialize = vi.spyOn(DataSource.prototype, 'initialize').mockResolvedValue({} as never);
    await SqlOrmDataSourceAdapter.open('postgresql://localhost/test', tables);
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('repository rejects an unregistered table', async () => {
    vi.spyOn(DataSource.prototype, 'initialize').mockResolvedValue({} as never);
    const adapter = await SqlOrmDataSourceAdapter.open('postgresql://localhost/test', tables);
    expect(() => adapter.repository('public.unknown')).toThrow(RepositoryValidationError);
  });

  it('onApplicationShutdown destroys an initialized data source', async () => {
    vi.spyOn(DataSource.prototype, 'initialize').mockResolvedValue({} as never);
    const destroy = vi.spyOn(DataSource.prototype, 'destroy').mockResolvedValue(undefined);
    const adapter = await SqlOrmDataSourceAdapter.open('postgresql://localhost/test', tables);
    Object.defineProperty(adapter.dataSource, 'isInitialized', { value: true });
    await adapter.onApplicationShutdown();
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
