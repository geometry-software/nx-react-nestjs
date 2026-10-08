import type { Pageable, PageableCollectionAdapter, CollectionSortOrder } from "../core/api.js";

export type FirebaseWhereOperator =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "array-contains"
  | "in"
  | "not-in"
  | "array-contains-any";

export type FirebaseFilter<TData> = {
  [TKey in Extract<keyof TData, string>]: {
    field: TKey;
    operator: FirebaseWhereOperator;
    value: TData[TKey] | readonly TData[TKey][];
  };
}[Extract<keyof TData, string>];

export type FirebaseRepositoryQuery<TData, TId = string> = {
  limit: number;
  filters?: readonly FirebaseFilter<TData>[];
  orderBy?: Extract<keyof TData, string>;
  order?: CollectionSortOrder;
  next?: TId;
  before?: TId;
};

export type FirebasePageInfo<TId> = {
  limit: number;
  next?: TId;
  before?: TId;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type FirebaseCursorResult<TData, TId = string> = {
  data: TData[];
  pageInfo: FirebasePageInfo<TId>;
};

export type FirebaseQueryPort<TData, TId = string> = Pageable<
  TData,
  FirebaseRepositoryQuery<TData, TId>,
  FirebaseCursorResult<TData, TId>
>;

export interface FirestoreAdapterPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> extends PageableCollectionAdapter<
    TData,
    TUpdate,
    FirebaseRepositoryQuery<TData, TId>,
    FirebaseCursorResult<TData, TId>,
    TId
  > { create(value: TData | TCreate): Promise<TData>; }
