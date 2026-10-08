export type CollectionEntity = {
  id: string;
  updatedAt: Date;
  createdAt: Date;
};

export type BulkDeleteResult = { deleted: number };

export type CollectionSortOrder = 'asc' | 'desc';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type PaginatedResult<TEntity> = {
  data: TEntity[];
  meta: PaginationMeta;
};

export class PageableCollectionQuery {
  page = 1;
  limit = 10;
  search?: string;
  sort = 'createdAt';
  order: CollectionSortOrder = 'desc';

  constructor(values: Partial<PageableCollectionQuery> = {}) {
    Object.assign(this, values);
  }
}

/**
 * Shared contract for adapters backed by a named collection or table.
 * Adapter-specific query and result types keep pagination native to each SDK.
 */
export type CollectionAdapter<
  TData,
  TUpdate = Partial<TData>,
  TId = string,
> = {
  getSource(): string;
  setSource(source: string): void;
  findAll(): Promise<TData[]>;
  findOne(id: TId): Promise<TData>;
  create(value: TData): Promise<TData>;
  update(id: TId, value: TUpdate): Promise<TData>;
  remove(id: TId): Promise<{ deleted: true }>;
  removeMany(ids: TId[]): Promise<BulkDeleteResult>;
}

/** Adds provider-specific pagination to a collection adapter. */
export type Pageable<TData, TQuery, TPageResult> = {
  findPage(query: TQuery): Promise<TPageResult>;
  /** Executes a provider-specific read expression. */
  query(expression: string): Promise<TData[]>;
}

export type PageableOptions<TData> = {
  searchableFields?: readonly Extract<keyof TData, string>[];
  sortableFields?: readonly Extract<keyof TData, string>[];
  sortFieldMap?: Readonly<Record<string, string>>;
  defaultSort?: Extract<keyof TData, string>;
};

export type PageableCollectionAdapter<
  TData,
  TUpdate,
  TQuery,
  TPageResult,
  TId = string,
> = CollectionAdapter<TData, TUpdate, TId> &
  Pageable<TData, TQuery, TPageResult>;
