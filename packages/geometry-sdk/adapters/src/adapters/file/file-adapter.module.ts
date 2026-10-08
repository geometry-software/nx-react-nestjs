import { Module, type DynamicModule, type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { BenchmarkPdfReportAdapter } from './benchmark-pdf-report-adapter.js';
import { SimpleFileAdapter } from './file-adapter.js';

export type FileAdapterConfiguration =
  | { provider: 'simple-file'; filePath: string; fileSuffix?: string }
  | { provider: 'pdf' };

export type FileAdapterModuleOptions = FileAdapterConfiguration & { id: string };
export type FileAdapterAsyncModuleOptions = Pick<ModuleMetadata, 'imports'> & {
  id: string;
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<FileAdapterConfiguration>['useFactory'];
};

@Module({})
export class FileAdapterModule {
  /** Registers the adapter module with a synchronous configuration. */
  public static forRoot(options: FileAdapterModuleOptions): DynamicModule {
    return this.forRootAsync({ id: options.id, useFactory: () => options });
  }

  /** Registers the adapter module with an injected asynchronous configuration. */
  public static forRootAsync(options: FileAdapterAsyncModuleOptions): DynamicModule {
    const token = options.id;
    return {
      module: FileAdapterModule,
      imports: options.imports ?? [],
      providers: [{
        provide: token,
        inject: options.inject ?? [],
        useFactory: async (...dependencies: unknown[]) => {
          const configuration = await options.useFactory(...dependencies);
          if (configuration.provider === 'pdf') return new BenchmarkPdfReportAdapter();
          if (configuration.provider === 'simple-file') {
            return new SimpleFileAdapter(configuration.filePath, configuration.fileSuffix);
          }
          throw new Error('Expected a file provider');
        },
      }],
      exports: [token],
    };
  }
}
