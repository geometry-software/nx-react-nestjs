import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CollectionAdapterErrorFilter, configureSwaggerAdapter, readPort } from 'geometry-sdk/adapters';
import { AuthModule } from './app/auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: new URL(process.env.FRONTEND_PUBLIC_URL ?? 'http://localhost:4201').origin,
    credentials: true,
  });
  app.getHttpAdapter().getInstance().disable('etag');
  app.use(
    (_request: unknown, response: { setHeader(name: string, value: string): void }, next: () => void) => {
      response.setHeader('Cache-Control', 'no-store');
      next();
    },
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new CollectionAdapterErrorFilter());
  configureSwaggerAdapter(app, { title: 'Login service' });
  const port = readPort(process.env.LOGIN_PORT, 3001);
  await app.listen(port);
  Logger.log(
    `Login API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}

void bootstrap();
