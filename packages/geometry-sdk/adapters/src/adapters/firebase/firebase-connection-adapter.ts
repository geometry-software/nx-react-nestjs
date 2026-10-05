import { getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from './firebase-firestore-sdk.js';

export class FirebaseConnectionAdapter {
  private firestorePromise?: Promise<Firestore>;

  constructor(
    private readonly configuration: FirebaseOptions,
    private readonly appName: string,
  ) {}

  getFirestore(): Promise<Firestore> {
    this.firestorePromise ??= (async () => {
      const existing = getApps().find(({ name }) => name === this.appName);
      const app = existing ?? initializeApp(this.configuration, this.appName);
      await signInAnonymously(getAuth(app));
      return existing
        ? getFirestore(app)
        : initializeFirestore(app, { experimentalForceLongPolling: true });
    })();
    return this.firestorePromise;
  }
}
