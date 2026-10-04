import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  configureNestApplication,
  configureSwaggerAdapter,
  readPort,
} from 'geometry-sdk/adapters';
import { ProductsModule } from './app/products.module';
async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);
  configureNestApplication(app);
  configureSwaggerAdapter(app, { title: 'Products service' });
  const port = readPort(process.env.PRODUCTS_PORT, 3002);
  await app.listen(port);
  Logger.log(
    `Products API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}
void bootstrap();
