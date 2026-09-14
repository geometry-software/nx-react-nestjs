import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { SwaggerOptions } from '../models/swagger-options.js';

export function configureSwagger(
  app: INestApplication,
  options: SwaggerOptions,
): void {
  const builder = new DocumentBuilder()
    .setTitle(options.title)
    .setVersion(options.version ?? '1.0')
    .addBearerAuth();

  if (options.description) builder.setDescription(options.description);

  const document = SwaggerModule.createDocument(app, builder.build());
  SwaggerModule.setup(options.path ?? 'docs', app, document);
}
