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
- MongoDB — TypeORM repository with page-number pagination.
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
