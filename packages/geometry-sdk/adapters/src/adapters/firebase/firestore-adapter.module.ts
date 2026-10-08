import { Module, type DynamicModule } from '@nestjs/common';
import { getAuth, signInAnonymously } from 'firebase/auth';
import type { FirebaseOptions } from 'firebase/app';
import { assertAdapterProvider } from '../utils/assert-adapter-provider.js';
import { getFirebaseAppAdapter } from './firebase-app.adapter.js';
import type { FirebaseAdapterAsyncModuleOptions, FirebaseAdapterModuleOptions } from './firebase-adapter.module.js';
import { getFirestore, initializeFirestore, type Firestore } from './firebase-firestore-sdk.js';
import { FirestoreAdapter } from './firestore.adapter.js';

const firestoreClients = new Map<string, Promise<Firestore>>();

function getFirestoreAdapter(configuration: FirebaseOptions, appName: string): Promise<Firestore> {
  const existing = firestoreClients.get(appName);
  if (existing) return existing;

  const { app, existedBeforeAdapter } = getFirebaseAppAdapter(configuration, appName);
  const client = (async () => {
    await signInAnonymously(getAuth(app));
    return existedBeforeAdapter
      ? getFirestore(app)
      : initializeFirestore(app, { experimentalForceLongPolling: true });
  })();
  firestoreClients.set(appName, client);
  void client.catch(() => firestoreClients.delete(appName));
  return client;
}

@Module({})
export class FirestoreAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: FirebaseAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: FirebaseAdapterAsyncModuleOptions): DynamicModule {
    const token = options.id;
    return {
      module: FirestoreAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          assertAdapterProvider(configuration.provider, 'firebase');
          const firestore = await getFirestoreAdapter(
            configuration.configuration,
            configuration.appName ?? options.id,
          );
          return new FirestoreAdapter(firestore, configuration.source ?? options.id, {
            entityName: configuration.entityName ?? options.id,
          });
        },
      }],
      exports: [token],
    };
  }
}
