import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export type SwaggerAdapterOptions = {
  title: string;
  description?: string;
  version?: string;
  path?: string;
  tags?: readonly string[];
};

export function configureSwaggerAdapter(
  app: INestApplication,
  options: SwaggerAdapterOptions,
): void {
  const builder = new DocumentBuilder()
    .setTitle(options.title)
    .setVersion(options.version ?? '1.0');
  if (options.description) builder.setDescription(options.description);
  for (const tag of options.tags ?? []) builder.addTag(tag);
  const document = SwaggerModule.createDocument(app, builder.build());
  SwaggerModule.setup(options.path ?? 'docs', app, document);
}
