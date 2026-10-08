import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoAdapterModule } from 'geometry-sdk/adapters';
import { ProductsController } from './products.controller';
import { ProductMongoDBAdapter } from './adapters/product-mongodb.adapter';
import { productsMongoProviderConfiguration } from './providers/products-mongo.provider';
import { ProductsService } from './products.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongoAdapterModule.forRootAsync(productsMongoProviderConfiguration),
  ],
  controllers: [
    ProductsController
  ],
  providers: [
    ProductMongoDBAdapter, 
    ProductsService
  ],
})
export class ProductsModule {}
