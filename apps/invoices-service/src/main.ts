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
  configureSwagger(app, { title: 'Invoices service' });
  const port = readPort(process.env.INVOICES_PORT, 3005);
  await app.listen(port);
  Logger.log(
    `Invoices API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}

void bootstrap();
