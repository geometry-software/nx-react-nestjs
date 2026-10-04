import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  configureNestApplication,
  configureSwaggerAdapter,
  readPort,
} from 'geometry-sdk/adapters';
import { ShippingModule } from './app/shipping.module';

async function bootstrap() {
  const app = await NestFactory.create(ShippingModule);
  configureNestApplication(app);
  configureSwaggerAdapter(app, { title: 'Shipping service' });
  const port = readPort(process.env.SHIPPING_PORT, 3004);
  await app.listen(port);
  Logger.log(
    `Shipping API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}

void bootstrap();
