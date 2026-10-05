import type { PageableCollectionApi } from '../core/pageable.js';
import type { PaginatedResult } from '../core/types.js';
import { SupabaseSqlRepositoryAdapter } from './supabase-sql-repository-adapter.js';
import type { SupabaseSqlRepositoryQuery } from './types.js';

/** PostgreSQL implementation using parameterized LIMIT/OFFSET and COUNT queries. */
export class SqlCollectionProviderAdapter<
  TData extends object,
  TCreate extends object = TData,
  TUpdate extends object = Partial<TCreate>,
> extends SupabaseSqlRepositoryAdapter<TData, TCreate, TUpdate>
  implements PageableCollectionApi<
    TData, TCreate, TUpdate, SupabaseSqlRepositoryQuery<TData>, PaginatedResult<TData>
  > {
  findPage(request: SupabaseSqlRepositoryQuery<TData>): Promise<PaginatedResult<TData>> {
    return this.findAll(request);
  }
}
