import { Inject, Injectable } from '@nestjs/common';
import {
  createSqlAdapter,
  type PageableCollectionAdapter,
  type PaginatedResult,
  type SqlRepositoryQuery,
  type SqlConnectionAdapter,
  type SqlRepositoryAdapterPort,
} from 'geometry-sdk/adapters';
import {
  sessionSupabaseSqlProviderSource,
  sessionSupabaseSqlProviderConfiguration,
} from '../providers/session-supabase-sql.provider';
import { Session } from '../entities/session.entity';

export type CreateSessionRecord = Pick<Session, 'userId' | 'name' | 'email'> & {
  passwordHash?: string | null;
  firebaseUid?: string | null;
  firebaseIdToken?: string | null;
  verifiedAt?: Date | null;
};
export type UpdateSessionRecord = Partial<CreateSessionRecord>;

@Injectable()
export class SessionSqlAdapter implements PageableCollectionAdapter<
  Session,
  UpdateSessionRecord,
  SqlRepositoryQuery<Session>,
  PaginatedResult<Session>
> {
  private readonly adapter: SqlRepositoryAdapterPort<
    Session,
    CreateSessionRecord,
    UpdateSessionRecord
  >;

  constructor(
    @Inject(sessionSupabaseSqlProviderConfiguration.id)
    connection: SqlConnectionAdapter,
  ) {
    this.adapter = createSqlAdapter<Session, CreateSessionRecord, UpdateSessionRecord>({
      connection,
      source: sessionSupabaseSqlProviderSource,
      entity: Session,
      options: { pageable: { defaultSort: 'createdAt' } },
    });
  }

  public getSource(): string {
    return this.adapter.getSource();
  }

  public setSource(source: string): void {
    this.adapter.setSource(source);
  }

  public findAll(): Promise<Session[]> {
    return this.adapter.findAll();
  }

  public findPage(query: SqlRepositoryQuery<Session>): Promise<PaginatedResult<Session>> {
    return this.adapter.findPage(query);
  }

  public query(expression: string): Promise<Session[]> {
    return this.adapter.query(expression);
  }

  public findOne(id: string): Promise<Session> {
    return this.adapter.findOne(id);
  }

  public create(value: Session): Promise<Session> {
    return this.adapter.create(value);
  }

  public update(id: string, value: UpdateSessionRecord): Promise<Session> {
    return this.adapter.update(id, value);
  }

  public remove(id: string): Promise<{ deleted: true }> {
    return this.adapter.remove(id);
  }

  public removeMany(ids: string[]): Promise<{ deleted: number }> {
    return this.adapter.removeMany(ids);
  }

  public async findByEmail(email: string): Promise<Session | null> {
    const page = await this.adapter.findPage({
      page: 1,
      limit: 1,
      filters: [{ column: 'email', operator: 'eq', value: email }],
      order: [{ column: 'createdAt', direction: 'desc' }],
    });
    return page.data[0] ?? null;
  }

  public async findByFirebaseUid(uid: string): Promise<Session | null> {
    const page = await this.adapter.findPage({
      page: 1,
      limit: 1,
      filters: [{ column: 'firebaseUid', operator: 'eq', value: uid }],
      order: [{ column: 'createdAt', direction: 'desc' }],
    });
    return page.data[0] ?? null;
  }
}
