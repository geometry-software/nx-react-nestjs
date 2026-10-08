# Shipping service

Shipping owns shipments, recipient details, invoice and product snapshots, and tracking history. It runs on `SHIPPING_PORT` (default `3004`) and stores shipments in the MongoDB `shipments` collection. It reads invoices and users through their owning services instead of sharing their databases.

## Business flow

- Shipment creation resolves the selected invoices from Invoices and the preparer from Login. Every invoice must exist and be `complete`, and the selected user must be active. The service stores invoice, item, and user snapshots, generates a tracking number, and records a local creation event.
- Shipment updates can change recipient details, invoice selection, or preparer. Listing supports pagination, search, sorting, and status filtering; single and bulk deletion are also exposed.
- A tracking refresh requests events from the demonstration Dummy Package Place integration and merges them into the shipment. Location routes provide countries and cities from `countries.dev` for recipient forms.

`/api/shippings`, `/api/shippings/:id/tracking/refresh`, and `/api/locations` are exposed by separate controllers. Swagger is available at `/docs`.

## Structure and adapter connection

```text
src/main.ts                    Nest bootstrap and shared HTTP setup
src/app/shipping.module.ts      Mongo, HTTP, controllers, and port bindings
src/app/shipping*.controller.ts shipment and tracking routes
src/app/locations.controller.ts location lookup routes
src/app/shipping.service.ts     shipment use cases
src/app/entities/              Shipment and snapshot models
src/app/dto/                   request and response models
src/app/providers/             Mongo and internal HTTP URL configuration
src/app/adapters/              shipment-specific Mongo adapter
src/app/utils/                 pure snapshot and tracking-event functions
```

`ShippingModule` registers `MongoAdapterModule.forRootAsync(shippingMongoProviderConfiguration)` and `HttpAdapterModule`. The Mongo configuration reads `SHIPPING_MONGODB_URI`, selects the **ORM** implementation, and registers the `shipments` source, token, mapping, and paging options. `ShippingMongoDBAdapter` injects the SDK adapter. The module binds each integration port to a concrete HTTP client provided by the shared HTTP module. The Invoices and Login URLs come from `INVOICES_SERVICE_URL` and `LOGIN_SERVICE_URL`, or their service ports. `ShippingService` uses the ports and its Mongo adapter; controllers do not make database or third-party calls directly.

See the root [README](../../README.md) for workspace setup and service boundaries. Follow the root `AGENTS.md` policy before running checks or startup commands.
