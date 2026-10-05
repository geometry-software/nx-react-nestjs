import { SwaggerAdapter } from 'geometry-sdk/adapters';
import type { ServiceName } from '@/app/services/api.service';
import { swaggerServices } from '@/app/api/project-info.api';
import type { SwaggerDocument } from '../models/project-info.model';

export function getSwaggerDocuments(origin: string): Omit<SwaggerDocument, 'title'>[] {
  return new SwaggerAdapter<ServiceName>(
    origin,
    swaggerServices,
  ).getDocuments();
}
