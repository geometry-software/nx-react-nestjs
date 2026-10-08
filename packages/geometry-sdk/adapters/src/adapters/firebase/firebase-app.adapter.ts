import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';

const appExistedBeforeAdapter = new Map<string, boolean>();

/** Reuses the named Firebase app shared by Firestore and FireAuth. */
export function getFirebaseAppAdapter(
  configuration: FirebaseOptions,
  appName: string,
): { app: FirebaseApp; existedBeforeAdapter: boolean } {
  const existingApp = getApps().find(({ name }) => name === appName);
  if (!appExistedBeforeAdapter.has(appName)) {
    appExistedBeforeAdapter.set(appName, existingApp !== undefined);
  }
  return {
    app: existingApp ?? initializeApp(configuration, appName),
    existedBeforeAdapter: appExistedBeforeAdapter.get(appName) ?? false,
  };
}
