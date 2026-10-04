export type EntityId = string & { readonly __entityId: unique symbol };

export type RepositoryEntity = {
  id: EntityId;
  updatedAt: Date;
  createdAt?: Date;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<TEntity> = {
  data: TEntity[];
  meta: PaginationMeta;
};

export type BulkDeleteResult = { deleted: number };

export type DataContainer<TData> = Readonly<{
  data: TData;
}>;

export type RepositoryOptions<TData> = {
  entityName: string;
  searchableFields: readonly Extract<keyof TData, string>[];
  sortableFields: readonly Extract<keyof TData, string>[];
  sortFieldMap?: Readonly<Record<string, string>>;
  defaultSort?: Extract<keyof TData, string>;
};

export type RepositoryRecord = Record<string, unknown>;
