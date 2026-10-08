import { ConfigService } from '@nestjs/config';
import type { MongoAdapterAsyncModuleOptions } from 'geometry-sdk/adapters';
import { Product } from '../entities/product.entity';

export const productsMongoProviderConfiguration = {
  id: 'products',
  collections: [{
    token: 'PRODUCTS_MONGO_PROVIDER',
    source: 'products',
    entity: Product,
    options: {
      pageable: {
        searchableFields: ['name', 'description'],
        sortableFields: ['id', 'createdAt', 'updatedAt', 'price', 'quantity', 'name'],
        defaultSort: 'createdAt',
      },
    },
  }] as const,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'mongo',
    dialect: 'mongodb-ejson',
    implementation: 'native',
    connectionString: config.getOrThrow<string>('PRODUCTS_MONGODB_URI'),
  }),
} satisfies MongoAdapterAsyncModuleOptions;
