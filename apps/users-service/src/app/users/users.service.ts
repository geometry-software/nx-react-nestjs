import { Inject, Injectable } from '@nestjs/common';
import type { CrudListQueryDto } from '@nx-react-nestjs/backend-utils';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserMongoRepository } from './repositories/user-mongo.repository';

type UserMongoRepositoryPort = Pick<
  UserMongoRepository,
  'findAll' | 'findOne' | 'create' | 'update' | 'remove' | 'removeMany'
>;

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserMongoRepository)
    private readonly repository: UserMongoRepositoryPort,
  ) {}

  findAll(query: CrudListQueryDto) {
    return this.repository.findAll(query);
  }
  findOne(id: string) {
    return this.repository.findOne(id);
  }
  create(dto: CreateUserDto) {
    return this.repository.create(dto);
  }
  update(id: string, dto: UpdateUserDto) {
    return this.repository.update(id, dto);
  }
  remove(id: string) {
    return this.repository.remove(id);
  }

  removeMany(ids: string[]) {
    return this.repository.removeMany(ids);
  }
}
