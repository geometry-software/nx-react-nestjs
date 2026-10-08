import { Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { assertAdapterProvider } from '../utils/assert-adapter-provider.js';
import { createMemoryAdapter, type MemoryAdapterOptions } from './memory-adapter.js';

export type MemoryAdapterModuleConfiguration<TData, TCreate, TUpdate, TId> =
  MemoryAdapterOptions<TData, TCreate, TUpdate, TId> & { provider: 'memory' };

export type MemoryAdapterModuleOptions<TData, TCreate, TUpdate, TId> =
  MemoryAdapterModuleConfiguration<TData, TCreate, TUpdate, TId> & { id: string };

export type MemoryAdapterAsyncModuleOptions<TData, TCreate, TUpdate, TId> =
  Pick<ModuleMetadata, 'imports'> & {
    id: string;
    inject?: FactoryProvider['inject'];
    useFactory: FactoryProvider<MemoryAdapterModuleConfiguration<TData, TCreate, TUpdate, TId>>['useFactory'];
  };

@Module({})
export class MemoryAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot<TData, TCreate, TUpdate, TId = string>(
    options: MemoryAdapterModuleOptions<TData, TCreate, TUpdate, TId>,
  ): DynamicModule {
    return this.forRootAsync({ id: options.id, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync<TData, TCreate, TUpdate, TId = string>(
    options: MemoryAdapterAsyncModuleOptions<TData, TCreate, TUpdate, TId>,
  ): DynamicModule {
    const token = options.id;
    return {
      module: MemoryAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          assertAdapterProvider(configuration.provider, 'memory');
          return createMemoryAdapter(configuration);
        },
      }],
      exports: [token],
    };
  }
}
