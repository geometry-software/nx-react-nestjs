import type { BulkDeleteResult } from './types.js';
import type { CollectionApi } from './repository.js';

/** Pagination is a capability; its request and result remain provider-specific. */
export interface Pageable<TRequest, TResult> {
  findPage(request: TRequest): Promise<TResult>;
}

export interface PageableCollectionApi<
  TData,
  TCreate,
  TUpdate,
  TRequest,
  TResult,
  TId = string,
> extends CollectionApi<TData, TCreate, TUpdate, TId, TRequest, TResult>,
    Pageable<TRequest, TResult> {}

/** Keeps the existing findAll(request) API while exposing pagination explicitly. */
export abstract class PageableCollection<
  TData,
  TCreate,
  TUpdate,
  TRequest,
  TResult,
  TId = string,
> implements PageableCollectionApi<TData, TCreate, TUpdate, TRequest, TResult, TId> {
  abstract readonly source: string;
  abstract findPage(request: TRequest): Promise<TResult>;
  protected abstract findRecords(): Promise<TData[]>;
  abstract findOne(id: TId): Promise<TData>;
  abstract create(value: TCreate): Promise<TData>;
  abstract update(id: TId, value: TUpdate): Promise<TData>;
  abstract remove(id: TId): Promise<{ deleted: true }>;
  abstract removeMany(ids: TId[]): Promise<BulkDeleteResult>;

  findAll(): Promise<TData[]>;
  findAll(request: TRequest): Promise<TResult>;
  findAll(request?: TRequest): Promise<TData[] | TResult> {
    return request === undefined ? this.findRecords() : this.findPage(request);
  }
}
