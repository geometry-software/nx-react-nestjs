import { EntitySchema, type EntitySchemaColumnOptions, type Repository } from 'typeorm';
import { assertEntitySource, type EntitySource } from '../core/entity-source.js';
import { RepositoryValidationError } from '../core/errors.js';

/** TypeORM column metadata kept outside domain entity classes. */
export type OrmEntityMapping<TEntity extends object> = {
  columns: Readonly<Partial<Record<Extract<keyof TEntity, string> | '_id', EntitySchemaColumnOptions>>>;
};

export function createOrmEntitySchema(
  mapping: EntitySource<object>,
  orm: OrmEntityMapping<Record<string, unknown>>,
  provider: 'mongo' | 'sql',
): EntitySchema<Record<string, unknown>> {
  assertEntitySource(mapping);
  if (!Object.keys(orm.columns).length) {
    throw new RepositoryValidationError(`ORM column mapping is required for ${mapping.entity.name}`);
  }
  if (provider === 'mongo' && !orm.columns._id?.objectId) {
    throw new RepositoryValidationError('MongoDB ORM mapping requires an ObjectId column');
  }
  if (provider === 'sql' && !Object.values(orm.columns).some((column) => column?.primary)) {
    throw new RepositoryValidationError('SQL ORM mapping requires a primary column');
  }
  const parts = mapping.source.split('.');
  return new EntitySchema<Record<string, unknown>>({
    target: mapping.entity,
    name: mapping.entity.name,
    tableName: provider === 'sql' ? parts.at(-1) : mapping.source,
    schema: provider === 'sql' && parts.length > 1 ? parts[0] : undefined,
    columns: { ...orm.columns },
    synchronize: false,
  });
}

export function assertOrmRepositoryEntity<TEntity extends object>(
  mapping: EntitySource<TEntity>,
  repository: Repository<Record<string, unknown>>,
): void {
  if (repository.metadata.target !== mapping.entity) {
    throw new RepositoryValidationError(`ORM repository entity does not match ${mapping.entity.name}`);
  }
}
