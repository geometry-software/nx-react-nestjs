import type { RepositorySortOrder } from "../core/query.js";
import type { CrudRepositoryPort, RepositoryReadPort } from "../core/repository.js";

export type MemoryRepositoryQuery<TData> = {
  search?: string;
  sort?: string;
  order?: RepositorySortOrder;
  filter?: Partial<TData>;
};

export interface MemoryQueryPort<TData>
  extends RepositoryReadPort<
    TData,
    string,
    MemoryRepositoryQuery<TData>,
    TData[]
  > {}

export interface MemoryRepositoryPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> extends CrudRepositoryPort<
    TData,
    TCreate,
    TUpdate,
    TId,
    MemoryRepositoryQuery<TData>,
    TData[]
  > {
  compute<TResult>(calculation: (records: readonly TData[]) => TResult): Promise<TResult>;
}
