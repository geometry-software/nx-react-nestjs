import { RepositoryValidationError } from './errors.js';

/** An entity constructor paired with its storage source. */
export type EntitySource<TEntity extends object> = {
  source: string;
  entity: new () => TEntity;
};

export function assertEntitySource(source: EntitySource<object>): void {
  if (!source || !source.source?.trim() || typeof source.entity !== 'function' || !source.entity.name) {
    throw new RepositoryValidationError('Entity source requires a source name and an entity class');
  }
}

export function hydrateEntity<TEntity extends object>(
  source: EntitySource<TEntity>,
  record: object,
): TEntity {
  return Object.assign(new source.entity(), record);
}
