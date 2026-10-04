import type { ConfigService } from '@nestjs/config';
import { readPort } from '../../nest/bootstrap.js';

export function getInternalServiceOrigin(
  config: ConfigService,
  portKey: string,
  fallbackPort: number,
): string {
  const port = readPort(config.get<string>(portKey), fallbackPort);
  return `http://127.0.0.1:${port}`;
}
