import {
  FacebookAuthProvider,
  getIdToken,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithCredential,
  type Auth,
  type AuthCredential,
} from 'firebase/auth';
import { RepositoryConnectionError } from '../core/errors.js';

export type FirebaseAuthTokenSession = {
  uid: string;
  idToken: string;
  refreshToken: string;
};

export type FirebaseSocialProvider = 'google' | 'facebook' | 'github';

export type FirebaseSocialCredential = {
  provider: FirebaseSocialProvider;
  idToken?: string;
  accessToken?: string;
};

export class FirebaseAuthAdapterError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = FirebaseAuthAdapterError.name;
  }
}

/** Authentication operations for the named Firebase app. */
export class FireAuthAdapter {
  constructor(private readonly auth: Auth | null) {}

  /** Reports whether Firebase Auth has usable project configuration. */

  private getAuth(): Auth {
    if (!this.auth) throw new RepositoryConnectionError('Firebase Auth is not configured');
    return this.auth;
  }

  /** Validates a browser-issued anonymous ID token against this Firebase project. */
  public async verifyAnonymousIdToken(idToken: string): Promise<string> {
    const apiKey = this.getAuth().app.options.apiKey;
    if (!apiKey) throw new RepositoryConnectionError('Firebase Auth API key is not configured');
    let response: Response;
    try {
      response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        },
      );
    } catch {
      throw new RepositoryConnectionError('Firebase token verification failed');
    }
    if (response.status === 400 || response.status === 401) {
      throw new FirebaseAuthAdapterError('auth/invalid-id-token', 'Invalid Firebase ID token');
    }
    if (!response.ok) throw new RepositoryConnectionError('Firebase token verification failed');
    const payload: unknown = await response.json();
    const user = payload && typeof payload === 'object' && 'users' in payload &&
      Array.isArray(payload.users) ? payload.users[0] as unknown : undefined;
    if (!user || typeof user !== 'object' || !('localId' in user) ||
        typeof user.localId !== 'string' || 'disabled' in user && user.disabled === true) {
      throw new FirebaseAuthAdapterError('auth/invalid-id-token', 'Invalid Firebase ID token');
    }
    try {
      const claims: unknown = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8'));
      if (!claims || typeof claims !== 'object' || !('sub' in claims) ||
          claims.sub !== user.localId || !('firebase' in claims) ||
          !claims.firebase || typeof claims.firebase !== 'object' ||
          !('sign_in_provider' in claims.firebase) ||
          claims.firebase.sign_in_provider !== 'anonymous') {
        throw new Error('Unexpected Firebase token claims');
      }
    } catch {
      throw new FirebaseAuthAdapterError('auth/invalid-id-token', 'An anonymous Firebase ID token is required');
    }
    return user.localId;
  }

  /** Creates a distinct anonymous identity without sharing the server Auth instance's current user. */
  public async createAnonymousSession(): Promise<FirebaseAuthTokenSession> {
    const apiKey = this.getAuth().app.options.apiKey;
    if (!apiKey) throw new RepositoryConnectionError('Firebase Auth API key is not configured');
    let response: Response;
    try {
      response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ returnSecureToken: true }),
        },
      );
    } catch {
      throw new RepositoryConnectionError('Firebase anonymous sign-in failed');
    }
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      if (payload && typeof payload === 'object' && 'error' in payload &&
          payload.error && typeof payload.error === 'object' &&
          'message' in payload.error && payload.error.message === 'OPERATION_NOT_ALLOWED') {
        throw new FirebaseAuthAdapterError(
          'auth/operation-not-allowed',
          'Firebase Anonymous sign-in is disabled',
        );
      }
      throw new RepositoryConnectionError('Firebase anonymous sign-in failed');
    }
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object' ||
        !('localId' in payload) || typeof payload.localId !== 'string' ||
        !('idToken' in payload) || typeof payload.idToken !== 'string' ||
        !('refreshToken' in payload) || typeof payload.refreshToken !== 'string') {
      throw new RepositoryConnectionError('Firebase anonymous sign-in returned invalid data');
    }
    return {
      uid: payload.localId,
      idToken: payload.idToken,
      refreshToken: payload.refreshToken,
    };
  }

  /** Refreshes a client session; an invalid or revoked refresh token returns null. */
  public async refreshToken(refreshToken: string): Promise<FirebaseAuthTokenSession | null> {
    const apiKey = this.getAuth().app.options.apiKey;
    if (!apiKey) throw new RepositoryConnectionError('Firebase Auth API key is not configured');
    let response: Response;
    try {
      response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        },
      );
    } catch {
      throw new RepositoryConnectionError('Firebase Auth token refresh failed');
    }
    if (response.status === 400) return null;
    if (!response.ok) throw new RepositoryConnectionError('Firebase Auth token refresh failed');
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object' ||
        !('user_id' in payload) || typeof payload.user_id !== 'string' ||
        !('id_token' in payload) || typeof payload.id_token !== 'string' ||
        !('refresh_token' in payload) || typeof payload.refresh_token !== 'string') {
      throw new RepositoryConnectionError('Firebase Auth token refresh returned invalid data');
    }
    return {
      uid: payload.user_id,
      idToken: payload.id_token,
      refreshToken: payload.refresh_token,
    };
  }

  /** Exchanges an OAuth provider credential for a Firebase identity. */
  public async signInWithSocialCredential(
    input: FirebaseSocialCredential,
  ): Promise<FirebaseAuthTokenSession> {
    let credential: AuthCredential;
    switch (input.provider) {
      case 'google':
        credential = GoogleAuthProvider.credential(input.idToken ?? null, input.accessToken ?? null);
        break;
      case 'facebook':
        credential = FacebookAuthProvider.credential(input.accessToken ?? '');
        break;
      case 'github':
        credential = GithubAuthProvider.credential(input.accessToken ?? '');
        break;
      default:
        throw new FirebaseAuthAdapterError('auth/unsupported-provider', 'Unsupported social provider');
    }
    const result = await signInWithCredential(this.getAuth(), credential);
    return {
      uid: result.user.uid,
      idToken: await getIdToken(result.user),
      refreshToken: result.user.refreshToken,
    };
  }
}
