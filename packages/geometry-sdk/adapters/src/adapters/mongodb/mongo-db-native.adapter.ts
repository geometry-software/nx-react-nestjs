import type { OnApplicationShutdown } from '@nestjs/common';
import { MongoClient, type Collection, type Document } from 'mongodb';
import { RepositoryConnectionError, RepositoryValidationError } from '../core/errors.js';
import { assertAdapterProvider } from '../utils/assert-adapter-provider.js';
import type { MongoDbAdapterConfiguration } from './mongo-db-orm.adapter.js';

/** MongoDB driver connection used by native collection adapters. */
export class MongoDbNativeAdapter implements OnApplicationShutdown {
  private readonly client: MongoClient;
  private readonly sources: ReadonlySet<string>;

  constructor(configuration: MongoDbAdapterConfiguration, sources: readonly string[]) {
    assertAdapterProvider(configuration.provider, 'mongo');
    assertAdapterProvider(configuration.dialect, 'mongodb-ejson');
    this.client = new MongoClient(configuration.connectionString);
    this.sources = new Set(sources);
  }

  /** Opens the underlying data-source connection. */
  public async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch {
      await this.client.close();
      throw new RepositoryConnectionError('MongoDB native adapter connection failed');
    }
  }

  /** Returns the registered native MongoDB collection for a source. */
  public collection(source: string): Collection<Document> {
    if (!this.sources.has(source)) {
      throw new RepositoryValidationError(`MongoDB source is not registered: ${source}`);
    }
    return this.client.db().collection<Document>(source);
  }

  /** Closes the underlying connection during Nest application shutdown. */
  public async onApplicationShutdown(): Promise<void> {
    await this.client.close();
  }
}
