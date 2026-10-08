import { Inject, Injectable } from '@nestjs/common';
import type { CrudListQueryDto } from 'geometry-sdk/adapters';
import { UpdateUserDto } from './dto/user.dto';
import { UserMongoDBAdapter } from './adapters/user-mongodb.adapter';
import { normalizeEmail } from './utils/normalize-email';

type UserMongoDBAdapterPort = Pick<
  UserMongoDBAdapter,
  'findPage' | 'findOne' | 'update' | 'remove' | 'removeMany'
>;

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserMongoDBAdapter)
    private readonly adapter: UserMongoDBAdapterPort,
  ) {}

  public findPage(query: CrudListQueryDto) {
    return this.adapter.findPage(query);
  }

  public findOne(id: string) {
    return this.adapter.findOne(id);
  }

  public update(id: string, dto: UpdateUserDto) {
    return this.adapter.update(id, {
      ...dto,
      ...(dto.email ? { email: normalizeEmail(dto.email) } : {}),
    });
  }

  public remove(id: string) {
    return this.adapter.remove(id);
  }

  public removeMany(ids: string[]) {
    return this.adapter.removeMany(ids);
  }
}
