import { Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { SqlOrmDataSourceAdapter } from './sql-orm-data-source.adapter.js';
import { SqlNativePoolAdapter } from './sql-native-pool.adapter.js';
import { assertAdapterProvider } from '../utils/assert-adapter-provider.js';
import { RepositoryValidationError } from '../core/errors.js';
import type { OrmEntityMapping } from '../shared/orm-entity-mapping.js';
import type { SqlDialectName } from './sql-dialect.js';

export type SqlTableRegistration = {
  source: string;
  entity: new () => object;
  orm: OrmEntityMapping<Record<string, unknown>>;
};

export type SqlAdapterConfiguration = {
  provider: 'sql';
  dialect: SqlDialectName;
  connectionString: string;
  implementation?: 'native' | 'orm';
};

export type SqlAdapterModuleOptions = SqlAdapterConfiguration & { id: string; tables?: readonly SqlTableRegistration[] };
export type SqlAdapterAsyncModuleOptions = Pick<ModuleMetadata, 'imports'> & {
  id: string;
  tables?: readonly SqlTableRegistration[];
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<SqlAdapterConfiguration>['useFactory'];
};

@Module({})
export class SqlAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: SqlAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, tables: options.tables, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: SqlAdapterAsyncModuleOptions): DynamicModule {
    const token = options.id;
    return {
      module: SqlAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          assertAdapterProvider(configuration.provider, 'sql');
          if (configuration.implementation === 'orm' && !(options.tables?.length)) {
            throw new RepositoryValidationError('SQL ORM requires registered table metadata');
          }
          switch (configuration.dialect) {
            case 'supabase':
              return configuration.implementation === 'orm'
                ? SqlOrmDataSourceAdapter.open(configuration.connectionString, options.tables ?? [])
                : SqlNativePoolAdapter.open(configuration.connectionString);
            default:
              throw new Error(`Unsupported SQL dialect: ${String(configuration.dialect)}`);
          }
        },
      }],
      exports: [token],
    };
  }
}
