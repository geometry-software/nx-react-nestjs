import type { DataSource, Repository } from 'typeorm';

export type SqlDialectName = 'supabase';

export type SqlDialect = {
  readonly name: SqlDialectName;
  readonly caseInsensitiveLikeOperator: string;
};

export type SqlNativeConnectionAdapter = {
  readonly dialect: SqlDialect;
  readonly implementation: 'native';
  query<TRecord extends object>(statement: string, parameters?: readonly unknown[]): Promise<TRecord[]>;
};

export type SqlOrmConnectionAdapter = {
  readonly dialect: SqlDialect;
  readonly dataSource: DataSource;
  readonly implementation: 'orm';
  repository(source: string): Repository<Record<string, unknown>>;
};

export type SqlConnectionAdapter = SqlNativeConnectionAdapter | SqlOrmConnectionAdapter;
