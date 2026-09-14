import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalApiModule } from '@nx-react-nestjs/backend-utils';
import { Shipment } from './entities/shipment.entity';
import { CountriesDevClient } from './integrations/adapters/countries-dev.client';
import { DummyPackagePlaceTrackingClient } from './integrations/adapters/dummy-package-place-tracking.client';
import { InvoicesHttpClient } from './integrations/adapters/invoices-http.client';
import { UsersHttpClient } from './integrations/adapters/users-http.client';
import { GeographyPort } from './integrations/ports/geography.port';
import { InvoiceBillingPort } from './integrations/ports/invoice-billing.port';
import { TrackingPort } from './integrations/ports/tracking.port';
import { UserDirectoryPort } from './integrations/ports/user-directory.port';
import { ShippingMongoRepository } from './repositories/shipping-mongo.repository';
import { ShippingController } from './shipping.controller';
import { LocationsController } from './locations.controller';
import { ShippingService } from './shipping.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment]), ExternalApiModule],
  controllers: [ShippingController, LocationsController],
  providers: [
    ShippingMongoRepository,
    ShippingService,
    { provide: GeographyPort, useClass: CountriesDevClient },
    { provide: InvoiceBillingPort, useClass: InvoicesHttpClient },
    { provide: UserDirectoryPort, useClass: UsersHttpClient },
    { provide: TrackingPort, useClass: DummyPackagePlaceTrackingClient },
  ],
})
export class ShippingModule {}
