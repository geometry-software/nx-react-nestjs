import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExternalHttpClient,
  getInternalServiceOrigin,
} from '@nx-react-nestjs/backend-utils';
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
    const baseUrl = getInternalServiceOrigin(this.config, 'USERS_PORT', 3003);
    return this.http.execute<DirectoryUser>({
      provider: 'Users service',
      url: `${baseUrl}/api/users/${encodeURIComponent(id)}`,
    });
  }
}
