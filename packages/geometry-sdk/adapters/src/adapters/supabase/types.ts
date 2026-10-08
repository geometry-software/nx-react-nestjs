import type {
  PageableCollectionAdapter,
  Pageable,
  PaginationMeta,
  PaginatedResult,
  CollectionSortOrder,
} from "../core/api.js";

export type SupabaseFilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "in"
  | "is";

export type SupabaseFilter<TData> = {
  column: Extract<keyof TData, string>;
  operator: SupabaseFilterOperator;
  value: unknown;
};

export type SupabaseOrder<TData> = {
  column: Extract<keyof TData, string>;
  direction?: CollectionSortOrder;
};

export type SupabaseJsRepositoryQuery<TData> = Pick<PaginationMeta, 'page' | 'limit'> & {
  filters?: readonly SupabaseFilter<TData>[];
  order?: readonly SupabaseOrder<TData>[];
};

export type SupabaseJsQueryPort<TData> = Pageable<
  TData,
  SupabaseJsRepositoryQuery<TData>,
  PaginatedResult<TData>
>;

export interface SupabaseJsAdapterPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> extends PageableCollectionAdapter<
    TData,
    TUpdate,
    SupabaseJsRepositoryQuery<TData>,
    PaginatedResult<TData>,
    TId
  > { create(value: TData | TCreate): Promise<TData>; }
