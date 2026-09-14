import type { ConfigService } from '@nestjs/config';

export function createMongoTypeOrmOptions(
  config: ConfigService,
  connectionKey: string,
) {
  return {
    type: 'mongodb' as const,
    url: config.getOrThrow<string>(connectionKey),
    autoLoadEntities: true,
    synchronize: config.get<string>('NODE_ENV') !== 'production',
  };
}
