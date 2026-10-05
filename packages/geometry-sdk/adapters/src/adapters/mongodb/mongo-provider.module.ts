import { Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { MongoProviderConnection, type MongoProviderConfiguration } from './mongo-provider.connection.js';

export function getMongoProviderConnectionToken(id: string): string {
  return `data-provider:mongo:${id}`;
}

export type MongoProviderModuleOptions = MongoProviderConfiguration & { id: string };
export type MongoProviderAsyncModuleOptions = Pick<ModuleMetadata, 'imports'> & {
  id: string;
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<MongoProviderConfiguration>['useFactory'];
};

@Module({})
export class MongoProviderModule {
  static forRoot(options: MongoProviderModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, useFactory: () => options });
  }

  static forRootAsync(options: MongoProviderAsyncModuleOptions): DynamicModule {
    const token = getMongoProviderConnectionToken(options.id);
    return {
      module: MongoProviderModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const connection = new MongoProviderConnection(await options.useFactory(...dependencies));
          await connection.connect();
          return connection;
        },
      }],
      exports: [token],
    };
  }
}
