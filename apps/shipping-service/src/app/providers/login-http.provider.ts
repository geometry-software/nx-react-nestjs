import { ConfigService } from '@nestjs/config';
import { readPort } from 'geometry-sdk/adapters';

export const LOGIN_HTTP_BASE_URL = 'LOGIN_HTTP_BASE_URL';

export const loginHttpProviderConfiguration = {
  provide: LOGIN_HTTP_BASE_URL,
  inject: [ConfigService],
  useFactory: (config: ConfigService): string => {
    const configuredUrl = config.get<string>('LOGIN_SERVICE_URL');
    const baseUrl = configuredUrl ||
      `http://127.0.0.1:${readPort(config.get<string>('LOGIN_PORT'), 3001)}`;
    return new URL(baseUrl).toString().replace(/\/$/, '');
  },
};
