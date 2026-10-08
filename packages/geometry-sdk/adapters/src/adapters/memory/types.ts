import type { CollectionAdapter } from "../core/api.js";

export type MemoryAdapterPort<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> = CollectionAdapter<
    TData,
    TUpdate,
    TId
  > & { create(value: TCreate): Promise<TData>;
  compute<TResult>(calculation: (records: readonly TData[]) => TResult): Promise<TResult>;
};
