import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CollectionAdapterErrorFilter, configureSwaggerAdapter, readPort } from 'geometry-sdk/adapters';
import { InvoicesModule } from './app/invoices.module';

async function bootstrap() {
  const app = await NestFactory.create(InvoicesModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.getHttpAdapter().getInstance().disable('etag');
  app.use(
    (_request: unknown, response: { setHeader(name: string, value: string): void }, next: () => void) => {
      response.setHeader('Cache-Control', 'no-store');
      next();
    },
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new CollectionAdapterErrorFilter());
  configureSwaggerAdapter(app, { title: 'Invoices service' });
  const port = readPort(process.env.INVOICES_PORT, 3005);
  await app.listen(port);
  Logger.log(
    `Invoices API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}

void bootstrap();
