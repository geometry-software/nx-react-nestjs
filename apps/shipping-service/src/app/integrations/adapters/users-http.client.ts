import { Inject, Injectable } from '@nestjs/common';
import { FetchAdapter } from 'geometry-sdk/adapters';
import { LOGIN_HTTP_BASE_URL } from '../../providers/login-http.provider';
import {
  type DirectoryUser,
  UserDirectoryPort,
} from '../ports/user-directory.port';

@Injectable()
export class UsersHttpClient implements UserDirectoryPort {
  constructor(
    @Inject(LOGIN_HTTP_BASE_URL) private readonly baseUrl: string,
    private readonly http: FetchAdapter,
  ) {}

  async findUser(id: string): Promise<DirectoryUser> {
    return this.http.execute<DirectoryUser>({
      service: 'Login service user directory',
      url: `${this.baseUrl}/api/users/${encodeURIComponent(id)}`,
    });
  }
}
