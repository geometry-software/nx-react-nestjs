# Products service

Products owns the catalog and available stock. It runs as an independent NestJS application on `PRODUCTS_PORT` (default `3002`) and stores products in the MongoDB `products` collection. Invoices calls this service over HTTP; it does not read the product database directly.

## Business flow

- Catalog operations create, list, read, update, and delete products. List requests support pagination, search, sorting, and an `active` filter.
- `POST /api/products/resolve` returns product records for another service's snapshot or validation step.
- `POST /api/products/stock/deduct` aggregates requested quantities, rejects unavailable stock, and updates the affected products. Products remains the authority for stock quantities.

The public routes are defined in `products.controller.ts`; their request and response contracts live in `dto/`. Swagger is available at `/docs`.

## Structure and adapter connection

```text
src/main.ts                 Nest bootstrap, API prefix, validation, errors, Swagger
src/app/products.module.ts   ConfigModule and MongoAdapterModule wiring
src/app/products.controller.ts
src/app/products.service.ts  catalog and stock use cases
src/app/entities/            Product data model
src/app/dto/                 HTTP input and response models
src/app/providers/           Mongo connection, source, token, and paging options
src/app/adapters/            product-specific Mongo adapter
src/app/utils/               pure stock calculations
```

`ProductsModule` passes `productsMongoProviderConfiguration` to `MongoAdapterModule.forRootAsync`. The configuration reads `PRODUCTS_MONGODB_URI`, selects the **native** Mongo implementation and `mongodb-ejson` query dialect, registers the `products` source and its injection token, and defines searchable and sortable fields. `ProductMongoDBAdapter` injects that SDK adapter by token and exposes the collection and pagination operations to `ProductsService`. The controller calls the service; the service handles business decisions and delegates persistence to the adapter. Stock calculations remain pure functions in `utils/product-stock.ts`.

Use the root [README](../../README.md) for workspace setup and the shared [adapter README](../../packages/geometry-sdk/adapters/README.md) for SDK contracts. Follow the root `AGENTS.md` policy before running any checks or starting an application.
