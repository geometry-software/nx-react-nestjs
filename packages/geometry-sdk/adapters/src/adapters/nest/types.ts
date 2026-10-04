import type { InjectionToken } from "@nestjs/common";
import type { CrudRepositoryPort } from "../core/repository.js";

export type RepositoryAdapterName =
  "memory" | "mongodb" | "supabase" | "firebase";

export type RepositoryAdapterRegistration<TData, TCreate, TUpdate> = {
  adapter: RepositoryAdapterName;
  repository: CrudRepositoryPort<TData, TCreate, TUpdate>;
};

export type DataRepositoryToken<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
> = InjectionToken<CrudRepositoryPort<TData, TCreate, TUpdate, TId>>;
