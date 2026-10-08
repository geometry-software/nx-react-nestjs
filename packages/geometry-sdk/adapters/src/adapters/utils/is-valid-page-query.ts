import type { PaginationMeta } from '../core/api.js';

export function isValidPageQuery(query: Pick<PaginationMeta, 'page' | 'limit'>): boolean {
  return (
    Number.isInteger(query.page) &&
    query.page >= 1 &&
    Number.isInteger(query.limit) &&
    query.limit >= 1
  );
}
