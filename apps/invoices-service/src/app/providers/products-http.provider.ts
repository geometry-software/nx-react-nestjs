import { ConfigService } from '@nestjs/config';
import { readPort, type HttpAdapterAsyncModuleOptions } from 'geometry-sdk/adapters';

export const productsHttpProviderConfiguration = {
  id: 'products',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const configuredUrl = config.get<string>('PRODUCTS_SERVICE_URL');
    const baseUrl = configuredUrl ||
      `http://127.0.0.1:${readPort(config.get<string>('PRODUCTS_PORT'), 3002)}`;
    return { baseUrl };
  },
} satisfies HttpAdapterAsyncModuleOptions;

export const PRODUCTS_HTTP_ADAPTER_TOKEN = productsHttpProviderConfiguration.id;
