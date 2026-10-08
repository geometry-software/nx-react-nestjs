import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CollectionAdapterErrorFilter, configureSwaggerAdapter, readPort } from 'geometry-sdk/adapters';
import { ShippingModule } from './app/shipping.module';

async function bootstrap() {
  const app = await NestFactory.create(ShippingModule);
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
  configureSwaggerAdapter(app, { title: 'Shipping service' });
  const port = readPort(process.env.SHIPPING_PORT, 3004);
  await app.listen(port);
  Logger.log(
    `Shipping API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}

void bootstrap();
