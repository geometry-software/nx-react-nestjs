import { ConfigService } from '@nestjs/config';
import type { MongoAdapterAsyncModuleOptions, OrmEntityMapping } from 'geometry-sdk/adapters';
import { User } from '../entities/user.entity';

export const userOrmMapping = {
  columns: {
    _id: { type: String, objectId: true, primary: true },
    name: { type: String },
    email: { type: String },
    role: { type: String },
    active: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
} satisfies OrmEntityMapping<User>;

export const usersMongoProviderConfiguration = {
  id: 'users',
  collections: [{
    token: 'USERS_MONGO_PROVIDER',
    source: 'users',
    entity: User,
    orm: userOrmMapping,
    options: {
      pageable: {
        searchableFields: ['name', 'email'],
        sortableFields: ['id', 'createdAt', 'updatedAt', 'name', 'email', 'role'],
        defaultSort: 'createdAt',
      },
    },
  }] as const,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'mongo',
    dialect: 'mongodb-ejson',
    implementation: 'orm',
    connectionString: config.getOrThrow<string>('USERS_MONGODB_URI'),
  }),
} satisfies MongoAdapterAsyncModuleOptions;
