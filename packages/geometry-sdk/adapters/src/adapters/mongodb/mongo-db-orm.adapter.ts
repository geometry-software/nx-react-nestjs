import type { OnApplicationShutdown } from '@nestjs/common';
import { DataSource, type EntityTarget, type MongoRepository } from 'typeorm';
import { RepositoryConnectionError, RepositoryValidationError } from '../core/errors.js';
import type { CollectionEntity } from '../core/api.js';
import type { EntitySource } from '../core/entity-source.js';
import { createOrmEntitySchema, type OrmEntityMapping } from '../shared/orm-entity-mapping.js';
import { assertAdapterProvider } from '../utils/assert-adapter-provider.js';

export type MongoDbAdapterConfiguration = {
  provider: 'mongo';
  dialect: 'mongodb-ejson';
  connectionString: string;
  implementation?: 'native' | 'orm';
};

export type MongoDbOrmSource = {
  mapping: EntitySource<CollectionEntity>;
  orm: OrmEntityMapping<CollectionEntity & Record<string, unknown>>;
};

/** Owns the TypeORM MongoDB data source and registered collection metadata. */
export class MongoDbOrmAdapter implements OnApplicationShutdown {
  private readonly dataSource: DataSource;
  private readonly targets = new Map<string, new () => CollectionEntity>();

  constructor(configuration: MongoDbAdapterConfiguration, sources: readonly MongoDbOrmSource[]) {
    assertAdapterProvider(configuration.provider, 'mongo');
    assertAdapterProvider(configuration.dialect, 'mongodb-ejson');
    const entities = sources.map(({ mapping, orm }) => {
      this.targets.set(mapping.source, mapping.entity);
      return createOrmEntitySchema(mapping, orm, 'mongo');
    });
    this.dataSource = new DataSource({
      type: 'mongodb',
      url: configuration.connectionString,
      entities,
      synchronize: false,
    });
  }

  /** Opens the underlying data-source connection. */
  public async connect(): Promise<void> {
    try {
      await this.dataSource.initialize();
    } catch {
      if (this.dataSource.isInitialized) await this.dataSource.destroy();
      throw new RepositoryConnectionError('MongoDB adapter connection failed');
    }
  }

  /** Returns the registered TypeORM repository for a source. */
  public repository(source: string): MongoRepository<Record<string, unknown>> {
    const target = this.targets.get(source);
    if (!target) throw new RepositoryValidationError(`MongoDB source is not registered: ${source}`);
    return this.dataSource.getMongoRepository<Record<string, unknown>>(
      target as EntityTarget<Record<string, unknown>>,
    );
  }

  /** Closes the underlying connection during Nest application shutdown. */
  public async onApplicationShutdown(): Promise<void> {
    if (this.dataSource.isInitialized) await this.dataSource.destroy();
  }
}
