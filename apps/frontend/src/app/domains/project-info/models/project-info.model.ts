import type { ServiceName } from '@/app/services/api.service';

export type DesignSystemSampleRow = {
  id: string;
  name: string;
  status: string;
};

export type SwaggerDocument = {
  name: ServiceName;
  title: string;
  url: string;
};
