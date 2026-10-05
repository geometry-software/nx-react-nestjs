import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExternalHttpClient,
  getInternalServiceOrigin,
} from 'geometry-sdk/adapters';
import {
  type DirectoryUser,
  UserDirectoryPort,
} from '../ports/user-directory.port';

@Injectable()
export class UsersHttpClient implements UserDirectoryPort {
  constructor(
    private readonly config: ConfigService,
    private readonly http: ExternalHttpClient,
  ) {}

  async findUser(id: string): Promise<DirectoryUser> {
    const baseUrl = getInternalServiceOrigin(this.config, 'LOGIN_PORT', 3001);
    return this.http.execute<DirectoryUser>({
      service: 'Login service user directory',
      url: `${baseUrl}/api/users/${encodeURIComponent(id)}`,
    });
  }
}
