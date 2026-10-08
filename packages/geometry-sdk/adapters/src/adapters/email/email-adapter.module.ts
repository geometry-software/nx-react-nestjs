import { Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { EmailAdapter } from './email-adapter.js';
import { GoogleProviderAdapter, type GoogleProviderAdapterConfiguration } from './google-provider.adapter.js';

export type EmailAdapterConfiguration = { provider: 'google' } & GoogleProviderAdapterConfiguration;
export type EmailAdapterModuleOptions = EmailAdapterConfiguration;
export type EmailAdapterAsyncModuleOptions = Pick<ModuleMetadata, 'imports'> & {
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<EmailAdapterConfiguration>['useFactory'];
};

@Module({})
export class EmailAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: EmailAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: EmailAdapterAsyncModuleOptions): DynamicModule {
    return {
      module: EmailAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: EmailAdapter,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          if (configuration.provider !== 'google') throw new Error('Unsupported email adapter');
          return new GoogleProviderAdapter(configuration);
        },
      }],
      exports: [EmailAdapter],
    };
  }
}
