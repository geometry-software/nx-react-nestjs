import { afterEach, describe, expect, it, vi } from 'vitest';

const authSdk = vi.hoisted(() => ({
  googleCredential: vi.fn(() => ({ provider: 'google' })),
  facebookCredential: vi.fn(() => ({ provider: 'facebook' })),
  githubCredential: vi.fn(() => ({ provider: 'github' })),
  signInWithCredential: vi.fn().mockResolvedValue({ user: { uid: 'social-user', refreshToken: 'social-refresh' } }),
  getIdToken: vi.fn().mockResolvedValue('social-id-token'),
}));
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: { credential: authSdk.googleCredential },
  FacebookAuthProvider: { credential: authSdk.facebookCredential },
  GithubAuthProvider: { credential: authSdk.githubCredential },
  signInWithCredential: authSdk.signInWithCredential,
  getIdToken: authSdk.getIdToken,
}));

import { FireAuthAdapter } from '../src/adapters/firebase/fire-auth.adapter.js';

const firebaseAuth = { app: { options: { apiKey: 'test-key' } } };
function adapter() {
  return new FireAuthAdapter(firebaseAuth as never);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('FireAuthAdapter public methods', () => {
  it('verifyAnonymousIdToken accepts a validated anonymous identity', async () => {
    const claims = Buffer.from(JSON.stringify({
      sub: 'anonymous-user',
      firebase: { sign_in_provider: 'anonymous' },
    })).toString('base64url');
    const idToken = `header.${claims}.signature`;
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      users: [{ localId: 'anonymous-user' }],
    }), { status: 200 }));
    vi.stubGlobal('fetch', request);
    await expect(adapter().verifyAnonymousIdToken(idToken)).resolves.toBe('anonymous-user');
    expect(request.mock.calls[0][0]).toContain('accounts:lookup');
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ idToken });
  });

  it('verifyAnonymousIdToken rejects a non-anonymous identity', async () => {
    const claims = Buffer.from(JSON.stringify({
      sub: 'password-user',
      firebase: { sign_in_provider: 'password' },
    })).toString('base64url');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      users: [{ localId: 'password-user' }],
    }), { status: 200 })));
    await expect(adapter().verifyAnonymousIdToken(`header.${claims}.signature`))
      .rejects.toMatchObject({ code: 'auth/invalid-id-token' });
  });

  it('createAnonymousSession returns a distinct anonymous UID and tokens', async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      localId: 'anonymous-user', idToken: 'anonymous-id-token', refreshToken: 'anonymous-refresh',
    }), { status: 200 }));
    vi.stubGlobal('fetch', request);
    await expect(adapter().createAnonymousSession()).resolves.toEqual({
      uid: 'anonymous-user', idToken: 'anonymous-id-token', refreshToken: 'anonymous-refresh',
    });
    expect(request.mock.calls[0][0]).toContain('accounts:signUp');
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ returnSecureToken: true });
  });

  it('refreshToken maps a refreshed session and treats rejected tokens as absent', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        user_id: 'anonymous-user', id_token: 'new-id-token', refresh_token: 'new-refresh',
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 400 })));
    await expect(adapter().refreshToken('old-refresh')).resolves.toEqual({
      uid: 'anonymous-user', idToken: 'new-id-token', refreshToken: 'new-refresh',
    });
    await expect(adapter().refreshToken('invalid')).resolves.toBeNull();
  });

  it('signInWithSocialCredential exchanges Google, Facebook, and GitHub credentials', async () => {
    const instance = adapter();
    await expect(instance.signInWithSocialCredential({ provider: 'google', idToken: 'google-id' }))
      .resolves.toEqual({ uid: 'social-user', idToken: 'social-id-token', refreshToken: 'social-refresh' });
    await instance.signInWithSocialCredential({ provider: 'facebook', accessToken: 'facebook-access' });
    await instance.signInWithSocialCredential({ provider: 'github', accessToken: 'github-access' });
    expect(authSdk.googleCredential).toHaveBeenCalledWith('google-id', null);
    expect(authSdk.facebookCredential).toHaveBeenCalledWith('facebook-access');
    expect(authSdk.githubCredential).toHaveBeenCalledWith('github-access');
    expect(authSdk.signInWithCredential).toHaveBeenCalledTimes(3);
  });
});
