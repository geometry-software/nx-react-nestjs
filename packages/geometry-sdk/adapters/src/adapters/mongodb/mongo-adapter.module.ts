import { Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { MongoDbOrmAdapter, type MongoDbAdapterConfiguration } from './mongo-db-orm.adapter.js';
import { MongoDbNativeAdapter } from './mongo-db-native.adapter.js';
import { MongoDbNativeProviderAdapter, type MongoDbAdapterOptions } from './mongo-db-native-provider.adapter.js';
import { MongoDbOrmProviderAdapter } from './mongo-db-orm-provider.adapter.js';
import type { CollectionEntity } from '../core/api.js';
import type { OrmEntityMapping } from '../shared/orm-entity-mapping.js';
import { RepositoryValidationError } from '../core/errors.js';

export type MongoCollectionAdapterRegistration = {
  token: string;
  source: string;
  entity: new () => CollectionEntity;
  options: MongoDbAdapterOptions<CollectionEntity & Record<string, unknown>>;
  orm?: OrmEntityMapping<CollectionEntity & Record<string, unknown>>;
};

export type MongoAdapterModuleOptions = MongoDbAdapterConfiguration & {
  id: string;
  collections?: readonly MongoCollectionAdapterRegistration[];
};
export type MongoAdapterAsyncModuleOptions = Pick<ModuleMetadata, 'imports'> & {
  id: string;
  collections?: readonly MongoCollectionAdapterRegistration[];
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<MongoDbAdapterConfiguration>['useFactory'];
};

@Module({})
export class MongoAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: MongoAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, collections: options.collections, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: MongoAdapterAsyncModuleOptions): DynamicModule {
    const token = options.id;
    const collectionProviders = (options.collections ?? []).map(({ token: collectionToken, source, entity, options: collectionOptions }) => ({
      provide: collectionToken,
      inject: [token],
      useFactory: (connection: MongoDbOrmAdapter | MongoDbNativeAdapter) =>
        connection instanceof MongoDbOrmAdapter
          ? new MongoDbOrmProviderAdapter(connection, { source, entity }, collectionOptions, connection.repository(source))
          : new MongoDbNativeProviderAdapter(connection, { source, entity }, collectionOptions),
    }));
    return {
      module: MongoAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          if (configuration.implementation === 'orm' &&
            (options.collections ?? []).some(({ orm }) => !orm || Object.keys(orm.columns).length === 0)) {
            throw new RepositoryValidationError('MongoDB ORM collections require TypeORM column metadata');
          }
          const connection = configuration.implementation === 'orm'
            ? new MongoDbOrmAdapter(configuration, (options.collections ?? []).map(({ source, entity, orm }) => ({ mapping: { source, entity }, orm: orm! })))
            : new MongoDbNativeAdapter(configuration, (options.collections ?? []).map(({ source }) => source));
          await connection.connect();
          return connection;
        },
      }, ...collectionProviders],
      exports: [token, ...collectionProviders.map((provider) => provider.provide)],
    };
  }
}
