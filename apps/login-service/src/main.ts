import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  configureNestApplication,
  configureSwaggerAdapter,
  readPort,
} from 'geometry-sdk/adapters';
import { AuthModule } from './app/auth.module';
async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  configureNestApplication(app);
  configureSwaggerAdapter(app, { title: 'Login service' });
  const port = readPort(process.env.LOGIN_PORT, 3001);
  await app.listen(port);
  Logger.log(
    `Login API: http://localhost:${port}/api · Swagger: http://localhost:${port}/docs`,
  );
}
void bootstrap();
