import type { RepositoryQuery } from "../core/query.js";
import type { CollectionApi, RepositoryReadPort } from "../core/repository.js";
import type { PaginatedResult } from "../core/types.js";

export type MongoDbFieldFilter<TValue> =
  | TValue
  | {
      $eq?: TValue;
      $in?: readonly TValue[];
      $gt?: TValue;
      $gte?: TValue;
      $lt?: TValue;
      $lte?: TValue;
    };

export type MongoDbRepositoryQuery<TData> = RepositoryQuery & {
  filter?: Partial<{
    [TKey in keyof TData]: MongoDbFieldFilter<TData[TKey]>;
  }>;
};

export interface MongoDbQueryPort<TData>
  extends RepositoryReadPort<
    TData,
    string,
    MongoDbRepositoryQuery<TData>,
    PaginatedResult<TData>
  > {}

export interface MongoDbRepositoryAdapterPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> extends CollectionApi<
    TData,
    TCreate,
    TUpdate,
    TId,
    MongoDbRepositoryQuery<TData>,
    PaginatedResult<TData>
  > {}
