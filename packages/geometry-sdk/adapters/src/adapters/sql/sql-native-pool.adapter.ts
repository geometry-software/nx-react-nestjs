import type { OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { RepositoryConnectionError } from '../core/errors.js';
import type { SqlNativeConnectionAdapter } from './sql-dialect.js';
import { supabaseSqlProviderDialect } from './supabase-sql-provider-dialect.js';

/** Direct PostgreSQL transport for parameterized SQL statements. */
export class SqlNativePoolAdapter implements SqlNativeConnectionAdapter, OnApplicationShutdown {
  public readonly implementation = 'native' as const;
  public readonly dialect = supabaseSqlProviderDialect;

  private constructor(private readonly pool: Pool) {}

  /** Opens a data-source connection and returns its adapter. */
  public static async open(connectionString: string): Promise<SqlNativePoolAdapter> {
    const pool = new Pool({ connectionString });
    try {
      const client = await pool.connect();
      client.release();
      return new SqlNativePoolAdapter(pool);
    } catch {
      await pool.end();
      throw new RepositoryConnectionError('SQL native connection failed');
    }
  }

  /** Executes a parameterized SQL statement and returns its result rows. */
  public async query<TRecord extends object>(
    statement: string,
    parameters: readonly unknown[] = [],
  ): Promise<TRecord[]> {
    const result = await this.pool.query<Record<string, unknown>>(statement, [...parameters]);
    return result.rows as TRecord[];
  }

  /** Closes the underlying connection during Nest application shutdown. */
  public async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
