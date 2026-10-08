import { getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getIdToken,
  indexedDBLocalPersistence,
  initializeAuth,
  signInAnonymously,
  type User,
} from 'firebase/auth';

declare const __FIREBASE_CONFIG__: FirebaseOptions;

export type FirebaseIdentity = { uid: string; idToken: string };

let userRequest: Promise<User> | undefined;
const firebaseAppName = 'frontend-anonymous-session';

/** Restores the Firebase-managed browser identity and obtains its current ID token. */
export async function getFirebaseIdentity(): Promise<FirebaseIdentity> {
  userRequest ??= loadFirebaseUser().catch((error: unknown) => {
    userRequest = undefined;
    throw error;
  });
  const user = await userRequest;
  return { uid: user.uid, idToken: await getIdToken(user) };
}

async function loadFirebaseUser(): Promise<User> {
  if (!__FIREBASE_CONFIG__.apiKey || !__FIREBASE_CONFIG__.projectId) {
    throw new Error('Firebase Auth is not configured');
  }
  const app = getApps().find((candidate) => candidate.name === firebaseAppName)
    ?? initializeApp(__FIREBASE_CONFIG__, firebaseAppName);
  // Firebase Auth owns the persistent session in IndexedDB; app code stores no token.
  const auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
  await auth.authStateReady();
  const restoredUser = auth.currentUser;
  return restoredUser?.isAnonymous ? restoredUser : (await signInAnonymously(auth)).user;
}
