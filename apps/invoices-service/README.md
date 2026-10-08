# Invoices service

Invoices owns invoice records and their lifecycle. It runs on `INVOICES_PORT` (default `3005`), stores invoices in the MongoDB `invoices` collection, and asks Products for catalog data and stock changes through an HTTP integration.

## Business flow

- Creating an invoice resolves the selected products, checks availability, and stores product name, description, unit price, and quantity snapshots with a calculated total. The initial status is `pending`.
- A pending invoice can be edited or cancelled. Cancellation changes its status to `rejected`.
- Confirmation calls Products to deduct the selected quantities, then marks the invoice `complete`. This crosses two services; there is no shared database transaction between stock deduction and the invoice status update.
- `POST /api/invoices/resolve` returns invoices to Shipping without exposing the invoice database. Listing supports pagination, search, sorting, and a status filter.

The routes and Swagger response models are in `invoices.controller.ts` and `dto/`; Swagger is available at `/docs`. PDF creation belongs to the frontend and uses the stored invoice snapshots.

## Structure and adapter connection

```text
src/main.ts                  Nest bootstrap and shared HTTP setup
src/app/invoices.module.ts    Mongo and Products HTTP adapter registration
src/app/invoices.controller.ts
src/app/invoices.service.ts   invoice lifecycle and cross-service decisions
src/app/entities/             Invoice model and status enum
src/app/dto/                  request and response models
src/app/providers/            Mongo and Products HTTP configuration
src/app/adapters/             invoice-specific Mongo adapter
src/app/utils/                pure snapshot and availability calculations
```

`InvoicesModule` registers `MongoAdapterModule.forRootAsync(invoicesMongoProviderConfiguration)` and `HttpAdapterModule.forRootAsync(productsHttpProviderConfiguration)`. The Mongo configuration reads `INVOICES_MONGODB_URI`, selects the **ORM** Mongo implementation, registers the `invoices` source, its token, mapping, and paging fields. `InvoiceMongoDBAdapter` wraps the injected SDK adapter. The Products HTTP configuration reads `PRODUCTS_SERVICE_URL` or derives the URL from `PRODUCTS_PORT`; `ProductsHttpClientAdapter` implements `ProductsAdapterPort` through the shared HTTP module. `InvoicesService` depends on these domain-facing adapters and ports, while the controller exposes the HTTP API.

See the root [README](../../README.md) for workspace setup and service boundaries. Follow the root `AGENTS.md` policy before running checks or startup commands.
