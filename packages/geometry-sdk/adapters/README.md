# `geometry-sdk/adapters`

Shared infrastructure adapters for the NX Monorepo backend services.

The package consolidates shared backend infrastructure in an adapter-oriented
structure. Import only from the public package paths listed below.
Paths containing `src` or `dist` are implementation details and are not part of
the public API.

## Public runtime imports

| Package entry point | Runtime API |
| --- | --- |
| `geometry-sdk/adapters` | Aggregate entry point for adapter runtime APIs, including `configureNestApplication`, `createMongoTypeOrmOptions`, `AxiosExternalHttpClient`, `MongoCrudRepository`, `FileAdapter`, and `SwaggerAdapter` |
| `geometry-sdk/adapters/core` | `createApiResponseContainer`, `RepositoryQuery`, `isValidPageQuery`, `RepositoryError`, `RepositoryNotFoundError`, `RepositoryValidationError`, `RepositoryConflictError`, `RepositoryConnectionError`, `RepositoryOperationError`, `COLLECTION_METADATA_RECORD_ID`, `COLLECTION_UPDATE_RECORD_ID`, `isCollectionDataRecordId` |
| `geometry-sdk/adapters/http` | `AxiosExternalHttpClient`, `ExternalApiModule`, `ExternalHttpClient`, `getInternalServiceOrigin` |
| `geometry-sdk/adapters/file` | `FileAdapter` |
| `geometry-sdk/adapters/memory` | `createMemoryAdapter` |
| `geometry-sdk/adapters/mongodb` | `createMongoAdapter`, `MongoDbCollectionRepositoryAdapter`, `MongoCrudRepository` |
| `geometry-sdk/adapters/firebase` | `createFirebaseAdapter`, `FirebaseConnectionAdapter`, `FirebaseRepositoryAdapter` |
| `geometry-sdk/adapters/supabase` | `createSupabaseJsAdapter`, `createSupabaseSqlAdapter`, `SupabaseJsClientAdapter`, `SupabaseJsRepositoryAdapter`, `SupabaseSqlRepositoryAdapter` |
| `geometry-sdk/adapters/nest` | `createMemoryNestAdapter`, `createMongoNestAdapter`, `createFirebaseNestAdapter`, `createSupabaseJsNestAdapter`, `createSupabaseSqlNestAdapter`, `configureNestApplication`, `createMongoTypeOrmOptions`, `configureSwaggerAdapter`, `readPort`, `CrudListQueryDto`, `BulkDeleteDto`, `DATA_REPOSITORY`, `MEMORY_ADAPTER_OPTIONS`, `MONGO_ADAPTER_OPTIONS`, `FIREBASE_ADAPTER_OPTIONS`, `SUPABASE_JS_ADAPTER_OPTIONS`, `SUPABASE_SQL_ADAPTER_OPTIONS` |
| `geometry-sdk/adapters/pdf` | `BenchmarkPdfReportAdapter` |
| `geometry-sdk/adapters/swagger` | `SwaggerAdapter` |

TypeScript types are resolved from the same entry points and are not listed as
separate imports.

Shared application infrastructure is imported from the package root:

```ts
import {
  configureNestApplication,
  createMongoTypeOrmOptions,
  MongoCrudRepository,
} from 'geometry-sdk/adapters';
```

Repository factories are imported from their adapter entry points:

```ts
import { FileAdapter } from 'geometry-sdk/adapters';
import { createMemoryAdapter } from 'geometry-sdk/adapters';
import { createMongoAdapter } from 'geometry-sdk/adapters';
import { createFirebaseAdapter } from 'geometry-sdk/adapters';
import {
  createSupabaseJsAdapter,
  createSupabaseSqlAdapter,
} from 'geometry-sdk/adapters';
```

## Included adapters

- File — filesystem-backed structured data, adapted from the former Bump implementation.
- Memory — process-local repository implementation.
- MongoDB — native collection provider with page-number pagination; legacy TypeORM repositories remain available for existing services.
- Firebase — Firestore repository with cursor pagination.
- Supabase JS — PostgREST repository with range pagination.
- Supabase SQL — parameterized PostgreSQL repository with page-number pagination.
- Nest — NestJS dependency-injection adapters, bootstrap, and Swagger integration.
- PDF — PDF report implementations.
- Axios — shared outbound HTTP client with retries, cancellation, request IDs,
  timing, and consistent upstream errors.

Domain-specific adapters remain in their owning microservices because they map
domain contracts. They use the generic infrastructure exported here.

MongoDB, Firebase, Supabase JS, and Supabase SQL implement the shared
`CollectionApi` contract. Their required `source` option identifies the MongoDB
or Firestore collection or the Supabase table. Memory and PDF adapters are not
collection adapters and therefore do not require `source` or collection
pagination.

## Collection providers and pagination

`CollectionApi` defines collection CRUD. `Pageable<TRequest, TResult>` adds
`findPage(request)`, and `PageableCollectionApi` combines both contracts.
`PageableCollection` is an abstract implementation that delegates the existing
`findAll(request)` overload to `findPage` and keeps `findAll()` for all records.
Pagination requests and responses deliberately reflect each database's capabilities:

| Implementation | Request | Result | Database operations |
| --- | --- | --- | --- |
| `MongoCollectionProviderAdapter` | `MongoCollectionProviderQuery`: page, limit, search, sort, order | `PaginatedResult<T>`: data and totals | Native Mongo find, sort, skip, limit, countDocuments |
| `FirebaseCollectionProviderAdapter` | `FirebaseRepositoryQuery<T>`: limit, filters, orderBy, next or before | `FirebaseCursorResult<T>`: data and pageInfo | Firestore startAfter/endBefore and limit/limitToLast |
| `SqlCollectionProviderAdapter` | `SupabaseSqlRepositoryQuery<T>`: page, limit, filters, order | `PaginatedResult<T>`: data and totals | Parameterized PostgreSQL LIMIT/OFFSET and COUNT |

All three implement `PageableCollectionApi` and are exported from
`geometry-sdk/adapters`. Firebase and SQL reuse their existing repository
implementations, including codecs and validation. The SQL implementation uses
PostgreSQL syntax, not a universal SQL dialect. Its constructor accepts the
existing SQL client transport; Firebase accepts an initialized Firestore instance.

### Products Mongo provider

Products registers its named connection without importing TypeORM:

```ts
MongoProviderModule.forRootAsync({
  id: 'products',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    provider: 'mongo',
    connectionString: config.getOrThrow<string>('PRODUCTS_MONGODB_URI'),
  }),
});
```

`MongoProviderModule.forRoot` also accepts `{ id, provider, connectionString }`
directly. Use a MongoDB URI, including the database name, such as
`mongodb+srv://user:password@cluster.example/products`. The driver parses the URI.
Connection IDs scope Nest injection tokens and allow multiple provider registrations.
The module connects during initialization and closes on application shutdown;
enable Nest shutdown hooks for process signals.

The domain repository injects `getMongoProviderConnectionToken('products')` and
constructs `MongoCollectionProviderAdapter` with the collection name and allowed
search/sort fields. `CollectionCrudRepository` maps collection validation and
not-found errors to HTTP errors. Product is a plain model implementing the
adapter's `MongoCollectionProviderModel`, with Swagger metadata only.
The provider stores native `_id` values and exposes string `id` values, sets
timestamps, ignores undefined patches, and protects IDs and creation timestamps
from updates. Existing `products` documents do not need an ID migration.

Other microservices continue using their existing persistence adapters.
