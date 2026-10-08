import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import {
  type MongoDbOrmProviderAdapter,
  type PageableCollectionQuery,
  type PageableCollectionAdapter,
  type PaginatedResult,
} from 'geometry-sdk/adapters';
import { usersMongoProviderConfiguration } from '../providers/users-mongo.provider';
import { UpdateUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';

export type CreateUserRecord = Pick<User, 'name' | 'email' | 'role' | 'active'>;
export type UpdateUserRecord = UpdateUserDto;

@Injectable()
export class UserMongoDBAdapter implements PageableCollectionAdapter<
  User, UpdateUserRecord, PageableCollectionQuery, PaginatedResult<User>
>, OnModuleInit {
  constructor(
    @Inject(usersMongoProviderConfiguration.collections[0].token)
    private readonly adapter: MongoDbOrmProviderAdapter<User, CreateUserRecord, UpdateUserRecord>,
  ) {}

  public getSource(): string {
    return this.adapter.getSource();
  }

  public setSource(source: string): void {
    this.adapter.setSource(source);
  }

  public async onModuleInit(): Promise<void> {
    await this.adapter.ensureUniqueIndex('email');
  }

  public findAll(): Promise<User[]> {
    return this.adapter.findAll();
  }

  public findPage(request: PageableCollectionQuery): Promise<PaginatedResult<User>> {
    return this.adapter.findPage(request);
  }

  public query(expression: string): Promise<User[]> {
    return this.adapter.query(expression);
  }

  public findOne(id: string): Promise<User> {
    return this.adapter.findOne(id);
  }

  public create(value: User): Promise<User> {
    return this.adapter.create(value);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const page = await this.adapter.findPage({ page: 1, limit: 1, filter: { email } });
    return page.data[0] ?? null;
  }

  public update(id: string, value: UpdateUserRecord): Promise<User> {
    return this.adapter.update(id, value);
  }

  public remove(id: string): Promise<{ deleted: true }> {
    return this.adapter.remove(id);
  }

  public removeMany(ids: string[]): Promise<{ deleted: number }> {
    return this.adapter.removeMany(ids);
  }
}
