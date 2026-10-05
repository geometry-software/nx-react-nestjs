import type { OnApplicationShutdown } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { RepositoryConnectionError } from '../core/errors.js';

export type MongoProviderConfiguration = {
  provider: 'mongo';
  connectionString: string;
};

/** Owns the driver and connection lifecycle for one registered data source. */
export class MongoProviderConnection implements OnApplicationShutdown {
  private readonly client: MongoClient;

  constructor(configuration: MongoProviderConfiguration) {
    if (configuration.provider !== 'mongo') {
      throw new RepositoryConnectionError('Expected the mongo provider');
    }
    this.client = new MongoClient(configuration.connectionString);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      await this.client.close();
      throw new RepositoryConnectionError('Mongo provider connection failed', error);
    }
  }

  collection(source: string) {
    return this.client.db().collection(source);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.close();
  }
}
