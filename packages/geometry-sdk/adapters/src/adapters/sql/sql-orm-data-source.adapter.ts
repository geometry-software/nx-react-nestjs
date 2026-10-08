import type { OnApplicationShutdown } from '@nestjs/common';
import { DataSource, type EntityTarget, type Repository } from 'typeorm';
import { RepositoryConnectionError, RepositoryValidationError } from '../core/errors.js';
import { createOrmEntitySchema } from '../shared/orm-entity-mapping.js';
import type { SqlOrmConnectionAdapter } from './sql-dialect.js';
import type { SqlTableRegistration } from './sql-adapter.module.js';
import { supabaseSqlProviderDialect } from './supabase-sql-provider-dialect.js';

/** TypeORM PostgreSQL data source owned by the SQL adapter module. */
export class SqlOrmDataSourceAdapter
  implements SqlOrmConnectionAdapter, OnApplicationShutdown {
  public readonly dialect = supabaseSqlProviderDialect;
  public readonly implementation = 'orm' as const;

  private constructor(
    public readonly dataSource: DataSource,
    private readonly targets: ReadonlyMap<string, new () => object>,
  ) {}

  /** Opens a data-source connection and returns its adapter. */
  public static async open(
    connectionString: string,
    tables: readonly SqlTableRegistration[],
  ): Promise<SqlOrmDataSourceAdapter> {
    const targets = new Map<string, new () => object>();
    const entities = tables.map(({ source, entity, orm }) => {
      targets.set(source, entity);
      return createOrmEntitySchema({ source, entity }, orm, 'sql');
    });
    const dataSource = new DataSource({
      type: 'postgres',
      url: connectionString,
      entities,
      synchronize: false,
    });
    try {
      await dataSource.initialize();
      return new SqlOrmDataSourceAdapter(dataSource, targets);
    } catch {
      if (dataSource.isInitialized) await dataSource.destroy();
      throw new RepositoryConnectionError('SQL ORM connection failed');
    }
  }

  /** Returns the registered TypeORM repository for a source. */
  public repository(source: string): Repository<Record<string, unknown>> {
    const target = this.targets.get(source);
    if (!target) throw new RepositoryValidationError(`SQL source is not registered: ${source}`);
    return this.dataSource.getRepository<Record<string, unknown>>(
      target as EntityTarget<Record<string, unknown>>,
    );
  }

  /** Closes the underlying connection during Nest application shutdown. */
  public async onApplicationShutdown(): Promise<void> {
    if (this.dataSource.isInitialized) await this.dataSource.destroy();
  }
}
