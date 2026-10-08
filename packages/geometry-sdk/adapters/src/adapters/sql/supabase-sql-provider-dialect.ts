import type { SqlDialect } from './sql-dialect.js';

/** PostgreSQL syntax used by Supabase direct SQL connections. */
export const supabaseSqlProviderDialect: SqlDialect = {
  name: 'supabase',
  caseInsensitiveLikeOperator: 'ILIKE',
};
