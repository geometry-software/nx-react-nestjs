import { ConfigService } from '@nestjs/config';
import type { FirebaseAdapterAsyncModuleOptions } from 'geometry-sdk/adapters';

export const loginFirebaseAuthProviderConfiguration = {
  id: 'login',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'firebase',
    configuration: {
      apiKey: config.get<string>('FIREBASE_API_KEY') ?? '',
      authDomain: config.get<string>('FIREBASE_AUTH_DOMAIN') ?? '',
      projectId: config.get<string>('FIREBASE_PROJECT_ID') ?? '',
      storageBucket: config.get<string>('FIREBASE_STORAGE_BUCKET') ?? '',
      messagingSenderId: config.get<string>('FIREBASE_MESSAGING_SENDER_ID') ?? '',
      appId: config.get<string>('FIREBASE_APP_ID') ?? '',
      measurementId: config.get<string>('FIREBASE_MEASUREMENT_ID') ?? '',
    },
  }),
} satisfies FirebaseAdapterAsyncModuleOptions;
