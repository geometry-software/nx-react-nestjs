import { Global, Module } from '@nestjs/common';
import { ExternalHttpClient } from '../models/external-http-client.port.js';
import { AxiosExternalHttpClient } from './axios-external-http.client.js';

@Global()
@Module({
  providers: [
    AxiosExternalHttpClient,
    { provide: ExternalHttpClient, useExisting: AxiosExternalHttpClient },
  ],
  exports: [ExternalHttpClient],
})
export class ExternalApiModule {}
