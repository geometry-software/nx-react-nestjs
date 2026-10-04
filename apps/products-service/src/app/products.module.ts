import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createMongoTypeOrmOptions } from 'geometry-sdk/adapters';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductMongoRepository } from './repositories/product-mongo.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createMongoTypeOrmOptions(config, 'PRODUCTS_MONGODB_URI'),
    }),
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [ProductsController],
  providers: [ProductMongoRepository, ProductsService],
})
export class ProductsModule {}
