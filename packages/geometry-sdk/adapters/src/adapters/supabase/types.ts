import type { PageQuery, RepositorySortOrder } from "../core/query.js";
import type { CollectionApi, RepositoryReadPort } from "../core/repository.js";
import type { PaginatedResult } from "../core/types.js";

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
  direction?: RepositorySortOrder;
};

export type SupabaseJsRepositoryQuery<TData> = PageQuery & {
  filters?: readonly SupabaseFilter<TData>[];
  order?: readonly SupabaseOrder<TData>[];
};

export type SupabaseSqlRepositoryQuery<TData> = PageQuery & {
  filters?: readonly SupabaseFilter<TData>[];
  order?: readonly SupabaseOrder<TData>[];
};

export interface SupabaseJsQueryPort<TData>
  extends RepositoryReadPort<
    TData,
    string,
    SupabaseJsRepositoryQuery<TData>,
    PaginatedResult<TData>
  > {}

export interface SupabaseJsRepositoryAdapterPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> extends CollectionApi<
    TData,
    TCreate,
    TUpdate,
    TId,
    SupabaseJsRepositoryQuery<TData>,
    PaginatedResult<TData>
  > {}

export interface SupabaseSqlRepositoryAdapterPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> extends CollectionApi<
    TData,
    TCreate,
    TUpdate,
    TId,
    SupabaseSqlRepositoryQuery<TData>,
    PaginatedResult<TData>
  > {}
