import { ConfigService } from '@nestjs/config';
import type { OrmEntityMapping, SqlAdapterAsyncModuleOptions } from 'geometry-sdk/adapters';
import { Session } from '../entities/session.entity';

export const sessionSupabaseSqlProviderSource = 'public.Session';
export const sessionOrmMapping = {
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    userId: { type: 'text', nullable: true },
    name: { type: 'text', nullable: true },
    email: { type: 'text', nullable: true },
    passwordHash: { type: 'text', nullable: true },
    firebaseUid: { type: 'text', nullable: true },
    firebaseIdToken: { type: 'text', nullable: true },
    verifiedAt: { type: 'timestamptz', nullable: true },
    createdAt: { type: 'timestamptz' },
    updatedAt: { type: 'timestamptz' },
  },
} satisfies OrmEntityMapping<Session>;

export const sessionSupabaseSqlProviderConfiguration = {
  id: 'sessions',
  tables: [{
    source: sessionSupabaseSqlProviderSource,
    entity: Session,
    orm: sessionOrmMapping,
  }],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'sql',
    dialect: 'supabase',
    implementation: 'orm',
    connectionString: config.getOrThrow<string>('LOGIN_SUPABASE_SQL_URI'),
  }),
} satisfies SqlAdapterAsyncModuleOptions;
