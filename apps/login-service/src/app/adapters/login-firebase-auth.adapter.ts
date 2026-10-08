import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  FireAuthAdapter,
  type FirebaseAuthTokenSession,
  type FirebaseSocialCredential,
} from 'geometry-sdk/adapters';
import { loginFirebaseAuthProviderConfiguration } from '../providers/login-firebase-auth.provider';

export type SocialCredentialInput = FirebaseSocialCredential;

@Injectable()
export class LoginFirebaseAuthAdapter {
  constructor(
    @Inject(loginFirebaseAuthProviderConfiguration.id)
    private readonly adapter: FireAuthAdapter,
  ) {}

  public async verifyAnonymousIdToken(idToken: string): Promise<string> {
    try {
      return await this.adapter.verifyAnonymousIdToken(idToken);
    } catch (error) {
      if (hasFirebaseCode(error, 'auth/invalid-id-token')) {
        throw new UnauthorizedException('Invalid anonymous Firebase ID token');
      }
      throw error;
    }
  }

  public async socialLogin(input: SocialCredentialInput): Promise<FirebaseAuthTokenSession> {
    if (!input.idToken && !input.accessToken) {
      throw new BadRequestException('A social identity token or access token is required');
    }
    if (input.provider !== 'google' && !input.accessToken) {
      throw new BadRequestException('An access token is required for this social provider');
    }
    try {
      return await this.adapter.signInWithSocialCredential(input);
    } catch (error) {
      if (hasFirebaseCode(error, 'auth/operation-not-allowed')) {
        throw new ServiceUnavailableException('The social sign-in provider is disabled');
      }
      if (hasFirebaseCode(error, 'auth/invalid-credential') ||
          hasFirebaseCode(error, 'auth/invalid-idp-response') ||
          hasFirebaseCode(error, 'auth/account-exists-with-different-credential')) {
        throw new UnauthorizedException('Invalid social credential');
      }
      throw error;
    }
  }
}

function hasFirebaseCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}
