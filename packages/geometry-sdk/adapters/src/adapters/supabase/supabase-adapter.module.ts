import { Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { assertAdapterProvider } from '../utils/assert-adapter-provider.js';
import { SupabaseJsClient, type SupabaseJsProviderAuthOptions } from './supabase-js-client.js';
import { parseSupabaseJsConnectionString } from './utils/parse-supabase-js-connection-string.js';

export type SupabaseAdapterConfiguration = {
  provider: 'supabase-js';
  connectionString: string;
  auth?: SupabaseJsProviderAuthOptions;
};
export type SupabaseAdapterModuleOptions = SupabaseAdapterConfiguration & { id: string };
export type SupabaseAdapterAsyncModuleOptions = Pick<ModuleMetadata, 'imports'> & {
  id: string;
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<SupabaseAdapterConfiguration>['useFactory'];
};

@Module({})
export class SupabaseAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: SupabaseAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: SupabaseAdapterAsyncModuleOptions): DynamicModule {
    const token = options.id;
    return {
      module: SupabaseAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          assertAdapterProvider(configuration.provider, 'supabase-js');
          const { url, publishableKey } = parseSupabaseJsConnectionString(configuration.connectionString);
          return new SupabaseJsClient(url, publishableKey, configuration.auth);
        },
      }],
      exports: [token],
    };
  }
}
