import { ConfigService } from '@nestjs/config';
import type { EmailAdapterAsyncModuleOptions } from 'geometry-sdk/adapters';

export const loginEmailProviderConfiguration = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'google',
    host: config.get<string>('SMTP_HOST') ?? '',
    port: Number(config.get<string>('SMTP_PORT')),
    secure: config.get<string>('SMTP_SECURE') === 'true',
    user: config.get<string>('SMTP_USER') ?? '',
    password: config.get<string>('SMTP_PASS') ?? '',
    from: config.get<string>('SMTP_FROM') ?? '',
  }),
} satisfies EmailAdapterAsyncModuleOptions;
