import { ConfigService } from '@nestjs/config';
import { readPort } from 'geometry-sdk/adapters';

export const INVOICES_HTTP_BASE_URL = 'INVOICES_HTTP_BASE_URL';

export const invoicesHttpProviderConfiguration = {
  provide: INVOICES_HTTP_BASE_URL,
  inject: [ConfigService],
  useFactory: (config: ConfigService): string => {
    const configuredUrl = config.get<string>('INVOICES_SERVICE_URL');
    const baseUrl = configuredUrl ||
      `http://127.0.0.1:${readPort(config.get<string>('INVOICES_PORT'), 3005)}`;
    return new URL(baseUrl).toString().replace(/\/$/, '');
  },
};
