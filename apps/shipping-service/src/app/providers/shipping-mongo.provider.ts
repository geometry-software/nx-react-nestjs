import { ConfigService } from '@nestjs/config';
import type { MongoAdapterAsyncModuleOptions, OrmEntityMapping } from 'geometry-sdk/adapters';
import { Shipment } from '../entities/shipment.entity';

export const shipmentOrmMapping = {
  columns: {
    _id: { type: String, objectId: true, primary: true },
    trackingNumber: { type: String },
    status: { type: String },
    recipient: { type: 'simple-json' },
    items: { type: 'simple-json' },
    invoices: { type: 'simple-json' },
    createdBy: { type: 'simple-json' },
    trackingEvents: { type: 'simple-json' },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
} satisfies OrmEntityMapping<Shipment>;

export const shippingMongoProviderConfiguration = {
  id: 'shipments',
  collections: [{
    token: 'SHIPMENTS_MONGO_PROVIDER',
    source: 'shipments',
    entity: Shipment,
    orm: shipmentOrmMapping,
    options: {
      pageable: {
        searchableFields: ['trackingNumber', 'recipient.name'],
        sortableFields: ['id', 'createdAt', 'updatedAt', 'trackingNumber', 'status'],
        defaultSort: 'createdAt',
      },
    },
  }] as const,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'mongo',
    dialect: 'mongodb-ejson',
    implementation: 'orm',
    connectionString: config.getOrThrow<string>('SHIPPING_MONGODB_URI'),
  }),
} satisfies MongoAdapterAsyncModuleOptions;
