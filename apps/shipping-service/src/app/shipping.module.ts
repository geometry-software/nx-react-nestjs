import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  MongoAdapterModule,
  HttpAdapterModule,
} from 'geometry-sdk/adapters';
import { ShippingMongoDBAdapter } from './adapters/shipping-mongodb.adapter';
import { shippingMongoProviderConfiguration } from './providers/shipping-mongo.provider';
import { invoicesHttpProviderConfiguration } from './providers/invoices-http.provider';
import { loginHttpProviderConfiguration } from './providers/login-http.provider';
import { CountriesDevClient } from './integrations/adapters/countries-dev.client';
import { DummyPackagePlaceTrackingClient } from './integrations/adapters/dummy-package-place-tracking.client';
import { InvoicesHttpClient } from './integrations/adapters/invoices-http.client';
import { UsersHttpClient } from './integrations/adapters/users-http.client';
import { GeographyPort } from './integrations/ports/geography.port';
import { InvoiceBillingPort } from './integrations/ports/invoice-billing.port';
import { TrackingPort } from './integrations/ports/tracking.port';
import { UserDirectoryPort } from './integrations/ports/user-directory.port';
import { LocationsController } from './locations.controller';
import { ShippingTrackingController } from './shipping-tracking.controller';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongoAdapterModule.forRootAsync(shippingMongoProviderConfiguration),
    HttpAdapterModule,
  ],
  controllers: [
    ShippingController,
    LocationsController,
    ShippingTrackingController,
  ],
  providers: [
    ShippingMongoDBAdapter,
    ShippingService,
    invoicesHttpProviderConfiguration,
    loginHttpProviderConfiguration,
    { provide: GeographyPort, useClass: CountriesDevClient },
    { provide: InvoiceBillingPort, useClass: InvoicesHttpClient },
    { provide: UserDirectoryPort, useClass: UsersHttpClient },
    { provide: TrackingPort, useClass: DummyPackagePlaceTrackingClient },
  ],
})
export class ShippingModule {}
