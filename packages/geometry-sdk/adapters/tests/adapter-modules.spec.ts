import type { DynamicModule, FactoryProvider } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { EmailAdapter } from '../src/adapters/email/email-adapter.js';
import { EmailAdapterModule } from '../src/adapters/email/email-adapter.module.js';
import { BenchmarkPdfReportAdapter } from '../src/adapters/file/benchmark-pdf-report-adapter.js';
import { FileAdapterModule } from '../src/adapters/file/file-adapter.module.js';
import { FirebaseAdapterModule } from '../src/adapters/firebase/firebase-adapter.module.js';
import { FireAuthAdapterModule } from '../src/adapters/firebase/fire-auth-adapter.module.js';
import { FirestoreAdapterModule } from '../src/adapters/firebase/firestore-adapter.module.js';
import { HttpAdapterModule } from '../src/adapters/http/implementations/http-adapter.module.js';
import { FetchAdapter } from '../src/adapters/http/implementations/fetch.adapter.js';
import { MemoryAdapterModule } from '../src/adapters/memory/memory-adapter.module.js';
import { MemoryAdapter } from '../src/adapters/memory/memory-adapter.js';
import { MongoAdapterModule } from '../src/adapters/mongodb/mongo-adapter.module.js';
import { SqlAdapterModule } from '../src/adapters/sql/sql-adapter.module.js';
import { SupabaseAdapterModule } from '../src/adapters/supabase/supabase-adapter.module.js';

const memory = {
  provider: 'memory' as const,
  options: { entityName: 'Item' },
  getId: (value: { id: string }) => value.id,
  createId: () => 'new',
  create: (value: { id: string }) => value,
  update: (current: { id: string }) => current,
};
const email = {
  provider: 'google' as const,
  host: 'smtp.example.com', port: 587, secure: false,
  user: 'sender@example.com', password: 'secret', from: 'Sender',
};
const firebase = { provider: 'firebase' as const, configuration: { apiKey: 'key', projectId: 'project', appId: 'app' } };

const modules: {
  name: string;
  moduleClass: Function;
  forRoot: () => DynamicModule;
  forRootAsync: () => DynamicModule;
  expectedToken?: string | Function;
}[] = [
  {
    name: 'email', moduleClass: EmailAdapterModule,
    forRoot: () => EmailAdapterModule.forRoot(email),
    forRootAsync: () => EmailAdapterModule.forRootAsync({ inject: ['CONFIG'], useFactory: () => email }),
  },
  {
    name: 'file', moduleClass: FileAdapterModule,
    forRoot: () => FileAdapterModule.forRoot({ id: 'test', provider: 'pdf' }),
    forRootAsync: () => FileAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => ({ provider: 'pdf' }) }),
    expectedToken: 'test',
  },
  {
    name: 'firebase', moduleClass: FirebaseAdapterModule,
    forRoot: () => FirebaseAdapterModule.forRoot({ ...firebase, id: 'test' }),
    forRootAsync: () => FirebaseAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => firebase }),
  },
  {
    name: 'Firebase Auth', moduleClass: FireAuthAdapterModule,
    forRoot: () => FireAuthAdapterModule.forRoot({ ...firebase, id: 'test' }),
    forRootAsync: () => FireAuthAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => firebase }),
    expectedToken: 'test',
  },
  {
    name: 'Firestore', moduleClass: FirestoreAdapterModule,
    forRoot: () => FirestoreAdapterModule.forRoot({ ...firebase, id: 'test' }),
    forRootAsync: () => FirestoreAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => firebase }),
    expectedToken: 'test',
  },
  {
    name: 'HTTP', moduleClass: HttpAdapterModule,
    forRoot: () => HttpAdapterModule.forRoot({ id: 'test', baseUrl: 'https://example.com' }),
    forRootAsync: () => HttpAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => ({ baseUrl: 'https://example.com' }) }),
    expectedToken: 'test',
  },
  {
    name: 'memory', moduleClass: MemoryAdapterModule,
    forRoot: () => MemoryAdapterModule.forRoot({ ...memory, id: 'test' }),
    forRootAsync: () => MemoryAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => memory }),
    expectedToken: 'test',
  },
  {
    name: 'MongoDB', moduleClass: MongoAdapterModule,
    forRoot: () => MongoAdapterModule.forRoot({ id: 'test', provider: 'mongo', dialect: 'mongodb-ejson', connectionString: 'mongodb://localhost:27017' }),
    forRootAsync: () => MongoAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => ({ provider: 'mongo', dialect: 'mongodb-ejson', connectionString: 'mongodb://localhost:27017' }) }),
    expectedToken: 'test',
  },
  {
    name: 'SQL', moduleClass: SqlAdapterModule,
    forRoot: () => SqlAdapterModule.forRoot({ id: 'test', provider: 'sql', dialect: 'supabase', connectionString: 'postgresql://localhost/db' }),
    forRootAsync: () => SqlAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => ({ provider: 'sql', dialect: 'supabase', connectionString: 'postgresql://localhost/db' }) }),
    expectedToken: 'test',
  },
  {
    name: 'Supabase JS', moduleClass: SupabaseAdapterModule,
    forRoot: () => SupabaseAdapterModule.forRoot({ id: 'test', provider: 'supabase-js', connectionString: 'https://example.supabase.co:key' }),
    forRootAsync: () => SupabaseAdapterModule.forRootAsync({ id: 'test', inject: ['CONFIG'], useFactory: () => ({ provider: 'supabase-js', connectionString: 'https://example.supabase.co:key' }) }),
    expectedToken: 'test',
  },
];

describe.each(modules)('$name Nest module', ({ moduleClass, forRoot, forRootAsync, expectedToken }) => {
  it('forRoot registers the module and exposes its adapter', () => {
    const definition = forRoot();
    expect(definition.module).toBe(moduleClass);
    if (expectedToken) expect(definition.exports).toContain(expectedToken);
    else expect(definition.exports?.length).toBeGreaterThan(0);
  });

  it('forRootAsync retains the dependency injection and adapter export', () => {
    const definition = forRootAsync();
    expect(definition.module).toBe(moduleClass);
    if (expectedToken) {
      const provider = definition.providers?.find((value) => typeof value === 'object' && value !== null && 'provide' in value && value.provide === expectedToken);
      expect(provider).toMatchObject({ inject: ['CONFIG'] });
      expect(definition.exports).toContain(expectedToken);
    } else {
      expect(definition.exports?.length).toBeGreaterThan(0);
    }
  });
});

function factory(definition: DynamicModule, token: string | Function): FactoryProvider['useFactory'] {
  const provider = definition.providers?.find((value) =>
    typeof value === 'object' && value !== null && 'provide' in value && value.provide === token,
  ) as FactoryProvider | undefined;
  if (!provider) throw new Error('Expected adapter factory');
  return provider.useFactory;
}

describe('Nest adapter provider factories', () => {
  it('FileAdapterModule resolves the PDF implementation', async () => {
    const definition = FileAdapterModule.forRoot({ id: 'report', provider: 'pdf' });
    await expect(factory(definition, 'report')()).resolves.toBeInstanceOf(BenchmarkPdfReportAdapter);
  });

  it('MemoryAdapterModule resolves an independent in-memory collection', async () => {
    const definition = MemoryAdapterModule.forRoot({ ...memory, id: 'items' });
    await expect(factory(definition, 'items')()).resolves.toBeInstanceOf(MemoryAdapter);
  });

  it('HttpAdapterModule resolves the fetch transport with a valid base URL', async () => {
    const definition = HttpAdapterModule.forRoot({ id: 'products', baseUrl: 'https://example.com/' });
    await expect(factory(definition, 'products')()).resolves.toBeInstanceOf(FetchAdapter);
  });

  it('EmailAdapterModule resolves the configured email transport', async () => {
    const definition = EmailAdapterModule.forRoot(email);
    await expect(factory(definition, EmailAdapter)()).resolves.toBeInstanceOf(EmailAdapter);
  });
});
