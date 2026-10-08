import type {
  CollectionSortOrder,
  PageableCollectionAdapter,
  PaginationMeta,
  PaginatedResult,
} from '../core/api.js';

export type SqlFilterOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';

export type SqlFilter<TData> = {
  column: Extract<keyof TData, string>;
  operator: SqlFilterOperator;
  value: unknown;
};

export type SqlOrder<TData> = {
  column: Extract<keyof TData, string>;
  direction?: CollectionSortOrder;
};

export type SqlRepositoryQuery<TData> = Pick<PaginationMeta, 'page' | 'limit'> & {
  filters?: readonly SqlFilter<TData>[];
  order?: readonly SqlOrder<TData>[];
};

export type SqlRepositoryAdapterPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> = PageableCollectionAdapter<
  TData,
  TUpdate,
  SqlRepositoryQuery<TData>,
  PaginatedResult<TData>,
  TId
> & { create(value: TData | TCreate): Promise<TData> };
