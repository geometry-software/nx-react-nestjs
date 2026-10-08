import { ConfigService } from '@nestjs/config';
import type { MongoAdapterAsyncModuleOptions, OrmEntityMapping } from 'geometry-sdk/adapters';
import { Invoice } from '../entities/invoice.entity';

export const invoiceOrmMapping = {
  columns: {
    _id: { type: String, objectId: true, primary: true },
    name: { type: String },
    description: { type: String },
    status: { type: String },
    items: { type: 'simple-json' },
    total: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
} satisfies OrmEntityMapping<Invoice>;

export const invoicesMongoProviderConfiguration = {
  id: 'invoices',
  collections: [{
    token: 'INVOICES_MONGO_PROVIDER',
    source: 'invoices',
    entity: Invoice,
    orm: invoiceOrmMapping,
    options: {
      pageable: {
        searchableFields: ['name', 'description'],
        sortableFields: ['id', 'name', 'status', 'total', 'createdAt', 'updatedAt'],
        defaultSort: 'createdAt',
      },
    },
  }] as const,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'mongo',
    dialect: 'mongodb-ejson',
    implementation: 'orm',
    connectionString: config.getOrThrow<string>('INVOICES_MONGODB_URI'),
  }),
} satisfies MongoAdapterAsyncModuleOptions;
