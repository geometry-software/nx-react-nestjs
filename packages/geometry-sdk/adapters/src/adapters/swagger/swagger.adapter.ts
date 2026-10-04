import type {
  SwaggerDocument,
  SwaggerServiceDefinition,
} from './swagger.models.js';

export class SwaggerAdapter<TName extends string = string> {
  constructor(
    private readonly origin: string,
    private readonly services: readonly SwaggerServiceDefinition<TName>[],
  ) {}

  getDocuments(): SwaggerDocument<TName>[] {
    return this.services.map((service) => ({
      name: service.name,
      url: this.getDocumentationUrl(service),
    }));
  }

  private getDocumentationUrl(
    service: SwaggerServiceDefinition<TName>,
  ): string {
    const serviceOrigin = new URL(this.origin);
    serviceOrigin.port = String(service.port);
    return new URL(
      service.documentationPath ?? '/docs',
      `${serviceOrigin.origin}/`,
    ).toString();
  }
}
