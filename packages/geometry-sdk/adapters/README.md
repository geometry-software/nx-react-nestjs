# `geometry-sdk/adapters`

NestJS infrastructure adapters shared by the backend services. Import from
`geometry-sdk/adapters`; paths containing `src` or `dist` are internal.

## Nest adapter modules

Data sources register through `forRoot` or `forRootAsync`. Each registration has
an `id`; use that string directly as the connection's injection token.
The public registration API uses `Adapter` names. Provider connections and SDK
clients remain implementation details inside this package.

| Source | Nest module | Injection token |
| --- | --- | --- |
| MongoDB | `MongoAdapterModule` | Explicit collection `token` string |
| Firebase Firestore | `FirestoreAdapterModule` | the `id` string |
| Firebase Auth | `FireAuthAdapterModule` | the `id` string |
| Memory | `MemoryAdapterModule` | the `id` string |
| Supabase JS | `SupabaseAdapterModule` | the `id` string |
| SQL (Supabase dialect) | `SqlAdapterModule` | the `id` string |
| Simple file or PDF report | `FileAdapterModule` | the `id` string |
| Email (Google SMTP) | `EmailAdapterModule` | `EmailAdapter` class |
| HTTP | `HttpAdapterModule` | the configured `id` string; unconfigured imports also provide an HTTP client |

MongoDB accepts `{ id, provider: 'mongo', dialect: 'mongodb-ejson', connectionString, implementation }`,
where `implementation` is `native` or `orm` (default `native`). Every collection
registers `source` and `entity` directly. ORM collections also register
TypeORM field metadata in `orm.columns`; Nest injects a TypeORM
`MongoRepository` into `MongoDbOrmProviderAdapter`. Native collections use the
MongoDB driver's `Collection` in `MongoDbNativeProviderAdapter`. Firebase accepts
`{ id, provider: 'firebase', configuration, appName? }` with Firebase SDK
options. `FirebaseAdapterModule` remains a combined entry point and exports both
submodules with `${id}:firestore` and `${id}:auth` tokens.
The Firestore token resolves to a `FirestoreAdapter` and retains anonymous
sign-in during setup. The FireAuth token resolves to `FireAuthAdapter`,
which creates and restores anonymous token sessions and exchanges Google,
Facebook, or GitHub credentials for a Firebase identity. It does not implement
email/password authentication.
Both modules reuse the named Firebase app.
Memory accepts entity options and create/update callbacks. The file
module accepts either `{ provider: 'simple-file', filePath, fileSuffix? }` or
`{ provider: 'pdf' }`. `SimpleFileAdapter.save(model)` and `open()` operate on
that one path; the suffix defaults to `.data.ts`. Supabase JS uses `{ provider: 'supabase-js', connectionString, auth? }`
with a project URL containing an `apikey` query parameter. Its optional `auth`
settings are `persistSession` and `autoRefreshToken`, both `false` by default. The Supabase folder
contains `SupabaseJsClient` and `SupabaseJsAdapter`. Direct SQL uses the SQL adapter's Supabase dialect with
`{ provider: 'sql', dialect: 'supabase', connectionString, implementation }` with a PostgreSQL URI.
`SqlNativeRepositoryAdapter` sends parameterized SQL statements through `pg`; `SqlOrmRepositoryAdapter`
uses a TypeORM `Repository` for tables registered with `{ source, entity, orm }` in `tables`. The SQL `source` is
the table name, optionally qualified by schema. Both retain native `SELECT` in `query()`.
HTTP accepts `{ id, baseUrl, timeoutMs? }` through `forRoot` or an async factory
through `forRootAsync`. Inject the configured `id` string to make requests relative
to that base URL. Importing `HttpAdapterModule` without registration provides an
unconfigured HTTP client for callers that supply absolute URLs. The module uses
native `fetch` by default and retains `ExternalHttpClient` as a compatibility token.
`forRootAsync` also accepts Nest `imports`,
`inject`, and `useFactory`.
Email accepts `{ provider: 'google', host, port, secure, user, password, from }`.
`GoogleProviderAdapter` implements the shared `EmailAdapter` contract and sends messages
through Google SMTP. With port 587 and `secure: false`, it requires STARTTLS.

```ts
MongoAdapterModule.forRootAsync({
  id: 'products',
  collections: [{
    token: 'PRODUCTS_MONGO_PROVIDER',
    source: 'products',
    entity: Product,
    options: {
      pageable: {
        searchableFields: ['name', 'description'],
        sortableFields: ['id', 'createdAt', 'updatedAt', 'name'],
        defaultSort: 'createdAt',
      },
    },
  }],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'mongo',
    dialect: 'mongodb-ejson',
    implementation: 'native',
    connectionString: config.getOrThrow<string>('PRODUCTS_MONGODB_URI'),
  }),
});
```

Each microservice owns a domain adapter in its `adapters` folder. For example,
`ProductMongoDBAdapter` injects the configured `PRODUCTS_MONGO_PROVIDER` token and implements
`PageableCollectionAdapter` plus product-specific operations. Login uses MongoDB for `users`
and SQL ORM with the Supabase dialect for `Session`; invoices and shipping each register their own Mongo connection.
The service entities are plain models without TypeORM decorators. Products use native MongoDB;
users, invoices, and shipping use MongoDB ORM. `Session` uses SQL ORM. TypeORM schemas bind to the passed entity class rather than a generated
technical name. Native adapters require no ORM mapping metadata. Their
string `query` methods continue to accept MongoDB Extended JSON or SQL `SELECT`.

## Collection and pagination contracts

`CollectionAdapter` provides CRUD, `getSource()`, `setSource(source)`, and `findAll()` without parameters. `findAll()`
reads every record. `PageableCollectionAdapter` adds `findPage(request)` and a required
`query(expression: string)` read method. The expression syntax belongs to each
adapter: MongoDB accepts a MongoDB Extended JSON filter, SQL accepts one `SELECT`
statement, and Supabase JS accepts a JSON pagination request. Firebase does not
support the string query method; use `findPage` instead. Pass only trusted
expressions to SQL and MongoDB adapters. MongoDB configurations declare
`dialect: 'mongodb-ejson'`; for example, an `_id` filter uses
`{"_id":{"$oid":"507f1f77bcf86cd799439011"}}`.
`create` accepts the domain entity; services construct it before passing it to storage.

Searchable fields, sortable fields, sort mappings, and default sorting belong to
`PageableOptions` under each provider's `pageable` configuration. Non-pageable
memory adapters need only `entityName` for error messages. `MemoryAdapter`
implements `CollectionAdapter`; its optional `source` defaults to `entityName`,
and `setSource` switches between independent in-memory collections.

Pagination request and result types remain provider-specific:

| Adapter | `findPage` request | Result |
| --- | --- | --- |
| MongoDB | `MongoCollectionAdapterQuery`: page, limit (1–100), search, sort, order, optional filter | `PaginatedResult<T>` with total count |
| SQL (Supabase dialect) | `SqlRepositoryQuery<T>`: page, limit, filters, order | `PaginatedResult<T>` with total count |
| Supabase JS | `SupabaseJsRepositoryQuery<T>`: page, limit, filters, order | `PaginatedResult<T>` with total count |
| Firebase | `FirebaseRepositoryQuery<T>`: limit, filters, order, `next` or `before` cursor | `FirebaseCursorResult<T>` with cursor information |

`core` contains collection contracts and error classes. Error names and codes
are defined outside `core` and re-exported by `errors.ts`. The `http` folder
contains HTTP clients, service discovery, its list-query DTO, and the HTTP error bridge. The shared bulk-delete DTO lives under `shared/dto`. Each provider's
module, token, and configuration live next to its implementation. Internal
connection-string utilities are not package exports. The package root exports
the public APIs.
