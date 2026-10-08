import { swaggerServices } from '@/app/api/project-info.api';
import type { SwaggerDocument } from '../models/project-info.model';

export function getSwaggerDocuments(origin: string): Omit<SwaggerDocument, 'title'>[] {
  return swaggerServices.map(({ name, port }) => {
    const serviceOrigin = new URL(origin);
    serviceOrigin.port = String(port);
    return {
      name,
      url: new URL('/docs', serviceOrigin).toString(),
    };
  });
}
