/** Opaque domain identifier; persistence adapters choose its native representation. */
export type EntityId = string & { readonly __entityId: unique symbol };

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BulkDeleteResult = { deleted: number };
