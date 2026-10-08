import type { PageableOptions } from '../core/api.js';
import type { SqlConnectionAdapter } from './sql-dialect.js';
import { SqlNativeRepositoryAdapter } from './sql-native-repository-adapter.js';
import { SqlOrmRepositoryAdapter } from './sql-orm-repository-adapter.js';

export type SqlAdapterOptions<
  TEntity extends object, TCreate extends object, TUpdate extends object,
> = {
  source: string;
  entity: new () => TEntity;
  connection: SqlConnectionAdapter;
  options: { pageable?: PageableOptions<TEntity> };
  idColumn?: string;
};

export function createSqlAdapter<
  TEntity extends object, TCreate extends object, TUpdate extends object,
>(options: SqlAdapterOptions<TEntity, TCreate, TUpdate>) {
  const { connection, source, entity, idColumn } = options;
  const mapping = { source, entity };
  return connection.implementation === 'orm'
    ? new SqlOrmRepositoryAdapter<TEntity, TCreate, TUpdate>(connection, mapping, options.options, connection.repository(mapping.source), idColumn)
    : new SqlNativeRepositoryAdapter<TEntity, TCreate, TUpdate>(connection, mapping, options.options, idColumn);
}
