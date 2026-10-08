import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNotification } from 'geometry-sdk/components';
import { usePrepareFirebaseSessionMutation } from '../domains/auth/service/auth.service';
import { getFirebaseIdentity } from '../services/firebase-auth.service';
import { useI18n } from '../utils/i18n';

export type FirebaseSessionIdentity = {
  uid: string;
};

type FirebaseSessionContextValue = {
  session: FirebaseSessionIdentity | null;
};

const FirebaseSessionContext = createContext<FirebaseSessionContextValue | null>(null);

export function FirebaseSessionProvider({ children }: { children: ReactNode }) {
  const { translate } = useI18n();
  const { notifySuccess } = useNotification();
  const [prepareSession] = usePrepareFirebaseSessionMutation();
  const [session, setSession] = useState<FirebaseSessionIdentity | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void getFirebaseIdentity().then(async ({ uid, idToken }) => {
      const { created } = await prepareSession(idToken).unwrap();
      setSession({ uid });
      if (created) notifySuccess(translate('auth.sessionReady'));
    }).catch(() => {
      // Authentication forms can still report their own request errors.
    });
  }, [notifySuccess, prepareSession, translate]);

  const value = useMemo(() => ({ session }), [session]);

  return (
    <FirebaseSessionContext.Provider value={value}>
      {children}
    </FirebaseSessionContext.Provider>
  );
}

export function useFirebaseSession(): FirebaseSessionContextValue {
  const context = useContext(FirebaseSessionContext);
  if (!context) throw new Error('useFirebaseSession must be used within FirebaseSessionProvider');
  return context;
}
