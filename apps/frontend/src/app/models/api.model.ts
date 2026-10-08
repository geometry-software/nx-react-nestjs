export type PageMeta = {
  page: number;
  limit: number;
  total: number;
};

export type Page<TEntity> = {
  data: TEntity[];
  meta: PageMeta;
};

export type EntityWriteResponse<TEntity> = TEntity & { id: string };
export type DeleteResponse = { deleted: true };
export type BulkDeleteResponse = { deleted: number };
