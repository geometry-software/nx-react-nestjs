import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  configureNestApplication,
  configureSwaggerAdapter,
  readPort,
} from 'geometry-sdk/adapters';
import { InvoicesModule } from './app/invoices.module';

async function bootstrap() {
  const app = await NestFactory.create(InvoicesModule);
  configureNestApplication(app);
  configureSwaggerAdapter(app, { title: 'Invoices service' });
  const port = readPort(process.env.INVOICES_PORT, 3005);
  await app.listen(port);
  Logger.log(
    `Invoices API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}

void bootstrap();
