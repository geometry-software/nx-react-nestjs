import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoProviderModule } from 'geometry-sdk/adapters';
import { ProductsController } from './products.controller';
import { ProductMongoProviderRepository } from './repositories/product-mongo-provider.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongoProviderModule.forRootAsync({
      id: 'products',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        provider: 'mongo',
        connectionString: config.getOrThrow<string>('PRODUCTS_MONGODB_URI'),
      }),
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductMongoProviderRepository, ProductsService],
})
export class ProductsModule {}
