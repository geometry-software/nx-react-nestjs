import type { Document } from 'mongodb';
import type { CollectionEntity } from '../core/api.js';
import { hydrateEntity, type EntitySource } from '../core/entity-source.js';

/** Shared mapping between collection documents and domain entities. */
export function toMongoDocument(record: Document): Document {
  return Object.fromEntries(
    Object.entries(record).filter(([key, value]) => key !== 'id' && key !== '_id' && value !== undefined),
  );
}

export function fromMongoDocument<TEntity extends CollectionEntity>(
  mapping: EntitySource<CollectionEntity>,
  document: Document,
): TEntity {
  const { _id, ...fields } = document;
  return hydrateEntity(mapping, { ...fields, id: String(_id) }) as TEntity;
}
