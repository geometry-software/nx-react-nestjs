import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  createMongoTypeOrmOptions,
  ExternalApiModule,
} from 'geometry-sdk/adapters';
import { Invoice } from './entities/invoice.entity';
import { ProductsHttpClient } from './integrations/adapters/products-http.client';
import { ProductCatalogPort } from './integrations/ports/product-catalog.port';
import { InvoiceMongoRepository } from './repositories/invoice-mongo.repository';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createMongoTypeOrmOptions(config, 'INVOICES_MONGODB_URI'),
    }),
    TypeOrmModule.forFeature([Invoice]),
    ExternalApiModule,
  ],
  controllers: [InvoicesController],
  providers: [
    InvoiceMongoRepository,
    InvoicesService,
    { provide: ProductCatalogPort, useClass: ProductsHttpClient },
  ],
})
export class InvoicesModule {}
