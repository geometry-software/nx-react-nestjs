import type { BulkDeleteResult } from "./types.js";

export type CollectionApiAdapterOptions = {
  /** Collection or table name used by the adapter. */
  source: string;
};

export interface RepositoryReadPort<
  TData,
  TId = string,
  TQuery = never,
  TQueryResult = TData[],
> {
  findAll(): Promise<TData[]>;
  findAll(query: TQuery): Promise<TQueryResult>;
  findOne(id: TId): Promise<TData>;
}

export interface RepositoryCreatePort<TData, TCreate = TData> {
  create(value: TCreate): Promise<TData>;
}

export interface RepositoryUpdatePort<TData, TUpdate, TId = string> {
  update(id: TId, value: TUpdate): Promise<TData>;
}

export interface RepositoryDeletePort<TId = string> {
  remove(id: TId): Promise<{ deleted: true }>;
  removeMany(ids: TId[]): Promise<BulkDeleteResult>;
}

export interface CrudRepositoryPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
  TQuery = never,
  TQueryResult = TData[],
> extends RepositoryReadPort<TData, TId, TQuery, TQueryResult>,
    RepositoryCreatePort<TData, TCreate>,
    RepositoryUpdatePort<TData, TUpdate, TId>,
  RepositoryDeletePort<TId> {}

/**
 * Shared contract for repositories backed by a named collection or table.
 * Adapter-specific query and result types keep pagination native to each SDK.
 */
export interface CollectionApi<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
  TQuery = never,
  TQueryResult = TData[],
> extends CrudRepositoryPort<
    TData,
    TCreate,
    TUpdate,
    TId,
    TQuery,
    TQueryResult
  > {
  readonly source: string;
}
