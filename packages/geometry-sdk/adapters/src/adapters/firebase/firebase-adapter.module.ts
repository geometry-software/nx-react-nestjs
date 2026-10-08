import { Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import type { FirebaseOptions } from 'firebase/app';
import { FireAuthAdapterModule } from './fire-auth-adapter.module.js';
import { FirestoreAdapterModule } from './firestore-adapter.module.js';

export type FirebaseAdapterConfiguration = {
  provider: 'firebase';
  configuration: FirebaseOptions;
  appName?: string;
  source?: string;
  entityName?: string;
};
export type FirebaseAdapterModuleOptions = FirebaseAdapterConfiguration & { id: string };
export type FirebaseAdapterAsyncModuleOptions = Pick<ModuleMetadata, 'imports'> & {
  id: string;
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<FirebaseAdapterConfiguration>['useFactory'];
};

@Module({})
export class FirebaseAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: FirebaseAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: FirebaseAdapterAsyncModuleOptions): DynamicModule {
    return {
      module: FirebaseAdapterModule,
      imports: [
        FirestoreAdapterModule.forRootAsync({
          ...options,
          id: `${options.id}:firestore`,
          useFactory: async (...dependencies: unknown[]) => {
            const configuration = await options.useFactory(...dependencies);
            return {
              ...configuration,
              appName: configuration.appName ?? options.id,
              source: configuration.source ?? options.id,
            };
          },
        }),
        FireAuthAdapterModule.forRootAsync({
          ...options,
          id: `${options.id}:auth`,
          useFactory: async (...dependencies: unknown[]) => {
            const configuration = await options.useFactory(...dependencies);
            return { ...configuration, appName: configuration.appName ?? options.id };
          },
        }),
      ],
      exports: [FirestoreAdapterModule, FireAuthAdapterModule],
    };
  }
}
