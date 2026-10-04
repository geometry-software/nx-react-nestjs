import type { FactoryProvider, InjectionToken } from "@nestjs/common";
import type { ObjectLiteral } from "typeorm";
import {
  createFirebaseAdapter,
  type FirebaseAdapterOptions,
  type FirebaseRepositoryAdapterPort,
} from "../firebase/index.js";
import {
  createMemoryAdapter,
  type MemoryAdapterOptions,
  type MemoryRepositoryPort,
} from "../memory/index.js";
import {
  createMongoAdapter,
  type MongoDbRepositoryAdapterPort,
  type MongoAdapterOptions,
} from "../mongodb/index.js";
import {
  createSupabaseJsAdapter,
  createSupabaseSqlAdapter,
  type SupabaseJsAdapterOptions,
  type SupabaseJsRepositoryAdapterPort,
  type SupabaseSqlAdapterOptions,
  type SupabaseSqlRepositoryAdapterPort,
} from "../supabase/index.js";
import {
  DATA_REPOSITORY,
  FIREBASE_ADAPTER_OPTIONS,
  MEMORY_ADAPTER_OPTIONS,
  MONGO_ADAPTER_OPTIONS,
  SUPABASE_JS_ADAPTER_OPTIONS,
  SUPABASE_SQL_ADAPTER_OPTIONS,
} from "./tokens.js";

export function createMemoryNestAdapter<
  TData,
  TCreate = TData,
  TUpdate = TCreate,
  TId = string,
>(
  repositoryToken: InjectionToken = DATA_REPOSITORY,
): FactoryProvider<MemoryRepositoryPort<TData, TCreate, TUpdate, TId>> {
  return {
    provide: repositoryToken,
    useFactory: (
      options: MemoryAdapterOptions<TData, TCreate, TUpdate, TId>,
    ) => createMemoryAdapter(options),
    inject: [MEMORY_ADAPTER_OPTIONS],
  };
}

export function createMongoNestAdapter<
  TData extends ObjectLiteral,
  TCreate = TData,
  TUpdate = TCreate,
>(
  repositoryToken: InjectionToken = DATA_REPOSITORY,
): FactoryProvider<MongoDbRepositoryAdapterPort<TData, TCreate, TUpdate>> {
  return {
    provide: repositoryToken,
    useFactory: (options: MongoAdapterOptions<TData, TCreate, TUpdate>) =>
      createMongoAdapter(options),
    inject: [MONGO_ADAPTER_OPTIONS],
  };
}

export function createSupabaseJsNestAdapter<
  TData extends object,
  TCreate extends object = TData,
  TUpdate extends object = TCreate,
>(
  repositoryToken: InjectionToken = DATA_REPOSITORY,
): FactoryProvider<SupabaseJsRepositoryAdapterPort<TData, TCreate, TUpdate>> {
  return {
    provide: repositoryToken,
    useFactory: (options: SupabaseJsAdapterOptions<TData, TCreate, TUpdate>) =>
      createSupabaseJsAdapter(options),
    inject: [SUPABASE_JS_ADAPTER_OPTIONS],
  };
}

export function createSupabaseSqlNestAdapter<
  TData extends object,
  TCreate extends object = TData,
  TUpdate extends object = TCreate,
>(
  repositoryToken: InjectionToken = DATA_REPOSITORY,
): FactoryProvider<SupabaseSqlRepositoryAdapterPort<TData, TCreate, TUpdate>> {
  return {
    provide: repositoryToken,
    useFactory: (options: SupabaseSqlAdapterOptions<TData, TCreate, TUpdate>) =>
      createSupabaseSqlAdapter(options),
    inject: [SUPABASE_SQL_ADAPTER_OPTIONS],
  };
}

export function createFirebaseNestAdapter<
  TData extends object,
  TCreate extends object = TData,
  TUpdate extends object = TCreate,
>(
  repositoryToken: InjectionToken = DATA_REPOSITORY,
): FactoryProvider<FirebaseRepositoryAdapterPort<TData, TCreate, TUpdate>> {
  return {
    provide: repositoryToken,
    useFactory: (options: FirebaseAdapterOptions<TData, TCreate, TUpdate>) =>
      createFirebaseAdapter(options),
    inject: [FIREBASE_ADAPTER_OPTIONS],
  };
}
