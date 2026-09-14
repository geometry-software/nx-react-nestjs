import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  configureNestApplication,
  configureSwagger,
  readPort,
} from '@nx-react-nestjs/backend-utils';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureNestApplication(app);
  configureSwagger(app, { title: 'Shipping service' });
  const port = readPort(process.env.SHIPPING_PORT, 3004);
  await app.listen(port);
  Logger.log(
    `Shipping API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}

void bootstrap();
