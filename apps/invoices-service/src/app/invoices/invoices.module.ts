import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalApiModule } from '@nx-react-nestjs/backend-utils';
import { Invoice } from './entities/invoice.entity';
import { ProductsHttpClient } from './integrations/adapters/products-http.client';
import { ProductCatalogPort } from './integrations/ports/product-catalog.port';
import { InvoiceMongoRepository } from './repositories/invoice-mongo.repository';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]), ExternalApiModule],
  controllers: [InvoicesController],
  providers: [
    InvoiceMongoRepository,
    InvoicesService,
    { provide: ProductCatalogPort, useClass: ProductsHttpClient },
  ],
})
export class InvoicesModule {}
