import { BSON, ObjectId, type Document } from 'mongodb';
import type { CollectionEntity, PageableOptions } from '../core/api.js';
import { RepositoryValidationError } from '../core/errors.js';
import { isValidPageQuery } from '../utils/is-valid-page-query.js';
import type { MongoCollectionAdapterQuery } from './mongo-db-native-provider.adapter.js';

/** Shared query rules for the native MongoDB and TypeORM MongoDB adapters. */
export function parseMongoFilter(expression: string): Document {
  let filter: unknown;
  try {
    filter = BSON.EJSON.parse(expression);
  } catch {
    throw new RepositoryValidationError('MongoDB query must be a valid Extended JSON filter');
  }
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
    throw new RepositoryValidationError('MongoDB query must be an Extended JSON object');
  }
  return filter as Document;
}

export function buildMongoPageQuery<TData extends CollectionEntity>(
  query: MongoCollectionAdapterQuery,
  options: PageableOptions<TData>,
): { filter: Document; sort: string; direction: 1 | -1 } {
  if (!isValidPageQuery(query) || query.limit > 100) {
    throw new RepositoryValidationError('Pagination requires a positive integer page and a limit between 1 and 100');
  }

  const search = query.search?.trim();
  const searchableFields = options.searchableFields ?? [];
  const searchFilter = search && searchableFields.length
    ? { $or: searchableFields.map((field) => ({
        [field]: { $regex: escapeMongoRegex(search), $options: 'i' },
      })) }
    : null;
  const filter = query.filter
    ? searchFilter ? { $and: [query.filter, searchFilter] } : query.filter
    : searchFilter ?? {};
  const requestedSort = options.sortableFields?.includes(query.sort as Extract<keyof TData, string>)
    ? query.sort
    : options.defaultSort ?? 'createdAt';
  const sort = requestedSort === 'id' ? '_id' : options.sortFieldMap?.[requestedSort] ?? requestedSort;

  return { filter: filter as Document, sort, direction: query.order === 'asc' ? 1 : -1 };
}

export function parseMongoObjectIds(ids: string[]): ObjectId[] {
  if (ids.some((id) => !ObjectId.isValid(id))) {
    throw new RepositoryValidationError('One or more entity ids are invalid');
  }
  return [...new Set(ids)].map((id) => new ObjectId(id));
}

export function isMongoDuplicateKeyError(error: unknown): error is { code: 11000 } {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

function escapeMongoRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
