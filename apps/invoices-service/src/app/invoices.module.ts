import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  MongoAdapterModule,
  HttpAdapterModule,
} from 'geometry-sdk/adapters';
import { InvoiceMongoDBAdapter } from './adapters/invoice-mongodb.adapter';
import { invoicesMongoProviderConfiguration } from './providers/invoices-mongo.provider';
import { productsHttpProviderConfiguration } from './providers/products-http.provider';
import { ProductsHttpClientAdapter } from './integrations/adapters/products-http.adapter';
import { ProductsAdapterPort } from './integrations/ports/products-port.adapter';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongoAdapterModule.forRootAsync(invoicesMongoProviderConfiguration),
    HttpAdapterModule.forRootAsync(productsHttpProviderConfiguration),
  ],
  controllers: [InvoicesController],
  providers: [
    InvoiceMongoDBAdapter,
    InvoicesService,
    { provide: ProductsAdapterPort, useClass: ProductsHttpClientAdapter },
  ],
})
export class InvoicesModule {}
