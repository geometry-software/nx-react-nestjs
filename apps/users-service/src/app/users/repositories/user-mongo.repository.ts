import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoCrudRepository } from '@nx-react-nestjs/backend-utils';
import { MongoRepository, type DeepPartial } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserMongoRepository extends MongoCrudRepository<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(@InjectRepository(User) repository: MongoRepository<User>) {
    super(repository, {
      entityName: User.name,
      searchableFields: ['name', 'email'],
      sortableFields: ['createdAt', 'updatedAt', 'name', 'email', 'role'],
      defaultSort: 'createdAt',
    });
  }
  protected mapCreateDto(dto: CreateUserDto): DeepPartial<User> {
    return {
      ...dto,
      active: dto.active ?? true,
      email: dto.email.trim().toLowerCase(),
    };
  }
  protected override mapUpdateDto(dto: UpdateUserDto): DeepPartial<User> {
    return {
      ...dto,
      ...(dto.email ? { email: dto.email.trim().toLowerCase() } : {}),
    };
  }
}
