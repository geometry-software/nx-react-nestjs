import { Global, Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { ExternalHttpClient } from '../models/external-http-client.port.js';
import { FetchAdapter } from './fetch.adapter.js';

export type HttpAdapterConfiguration = {
  baseUrl: string;
  timeoutMs?: number;
};

export type HttpAdapterModuleOptions = HttpAdapterConfiguration & { id: string };

export type HttpAdapterAsyncModuleOptions = Pick<ModuleMetadata, 'imports'> & {
  id: string;
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<HttpAdapterConfiguration>['useFactory'];
};

@Global()
@Module({
  providers: [
    { provide: FetchAdapter, useFactory: () => new FetchAdapter() },
    { provide: ExternalHttpClient, useExisting: FetchAdapter },
  ],
  exports: [FetchAdapter, ExternalHttpClient],
})
export class HttpAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: HttpAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: HttpAdapterAsyncModuleOptions): DynamicModule {
    const token = options.id;
    return {
      module: HttpAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          const baseUrl = new URL(configuration.baseUrl).toString().replace(/\/$/, '');
          return new FetchAdapter({
            baseUrl,
            timeoutMs: configuration.timeoutMs,
          });
        },
      }],
      exports: [token],
    };
  }
}
