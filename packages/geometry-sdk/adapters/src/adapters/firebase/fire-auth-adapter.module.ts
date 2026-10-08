import { Module, type DynamicModule } from '@nestjs/common';
import { getAuth } from 'firebase/auth';
import { assertAdapterProvider } from '../utils/assert-adapter-provider.js';
import { getFirebaseAppAdapter } from './firebase-app.adapter.js';
import type { FirebaseAdapterAsyncModuleOptions, FirebaseAdapterModuleOptions } from './firebase-adapter.module.js';
import { FireAuthAdapter } from './fire-auth.adapter.js';

@Module({})
export class FireAuthAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: FirebaseAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: FirebaseAdapterAsyncModuleOptions): DynamicModule {
    const token = options.id;
    return {
      module: FireAuthAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          assertAdapterProvider(configuration.provider, 'firebase');
          if (!configuration.configuration.apiKey || !configuration.configuration.projectId ||
              !configuration.configuration.appId) {
            return new FireAuthAdapter(null);
          }
          const { app } = getFirebaseAppAdapter(
            configuration.configuration,
            configuration.appName ?? options.id,
          );
          return new FireAuthAdapter(getAuth(app));
        },
      }],
      exports: [token],
    };
  }
}
