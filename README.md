# NX Monorepo

An Nx workspace containing a React application, five independent NestJS microservices, and shared frontend and backend packages. The project demonstrates domain-owned APIs, service-to-service communication, URL-driven tables, Mongo Cloud persistence, invoice processing, and shipment tracking.

## Technology

Nx 23 · React 19 · Vite · RTK Query · Zod · Tailwind CSS 4 · ShadCN/Radix · NestJS 12 · TypeORM · Mongo Cloud · Axios · Swagger/OpenAPI · Vitest

## Getting started

Install a supported version of [Node.js](https://nodejs.org/en/download), download and unpack the [repository](https://github.com/geometry-software/nx-react-nestjs), then open a terminal in the extracted directory.

```bash
npm start
```

This single command installs dependencies, starts the complete workspace, and opens [http://localhost:4201](http://localhost:4201). The application uses a demonstration Mongo Cloud environment, so MongoDB does not need to be installed locally.

Multilingual end-user instructions are available inside the application under **Project Info → Installation**.

## Workspace

```text
apps/
  frontend/          React application                                :4201
  auth-service/      registration, login, and JWT                     :3001
  products-service/  catalog, pricing, and stock                      :3002
  users-service/     user directory and roles                         :3003
  shipping-service/  shipments, recipients, and tracking              :3004
  invoices-service/  invoice lifecycle and stock confirmation         :3005

packages/
  components/        shared frontend design system
  backend-utils/     shared backend contracts and infrastructure

scripts/
  start-open.mjs     installs, starts, and opens the workspace
  seed.sh            loads demonstration products and users
```

## Microservices

### Auth service

Owns registration and login. It validates credentials, stores authentication records in its own cloud database, and issues JWTs. Catalog and operational domains are intentionally not protected by this service in the demonstration application.

### Users service

Owns the user directory and roles. It provides independent CRUD and bulk deletion and supplies user snapshots to Shipping.

### Products service

Owns product names, descriptions, inventory identifiers, prices, and available quantities. It provides CRUD, bulk deletion, product snapshot resolution, and atomic stock deduction used when an invoice is confirmed.

### Invoices service

Creates invoices from selected products and stores immutable product name, description, price, and quantity snapshots. An invoice moves through `pending`, `complete`, or `rejected` states. Confirming an invoice asks Products to validate and deduct stock; cancelling it marks the invoice as rejected. Invoice printing is initiated by the frontend from the stored invoice data.

### Shipping service

Creates shipments from confirmed invoices and a selected user. It resolves invoice snapshots from Invoices, resolves the preparer from Users, generates a tracking number after creation, and stores recipient, invoice, product-line, and tracking snapshots. It also exposes location lookup and tracking refresh operations.

Shipping is the only service that communicates with third-party providers:

- `countries.dev` supplies country and dependent city suggestions.
- `Dummy Package Place Service` supplies demonstration tracking events with synthetic dates and statuses. It is not a real carrier integration.

All services have their own controllers, domain services, DTOs, entities, and Mongo-specific repositories. There is no runtime Core microservice.

## Data flow

```text
React :4201
  ├─► Auth :3001 ──────────────────────────────► TypeORM ─► Cloud / nx_auth
  ├─► Products :3002 ──────────────────────────► TypeORM ─► Cloud / nx_products
  ├─► Users :3003 ─────────────────────────────► TypeORM ─► Cloud / nx_users
  ├─► Invoices :3005 ─► Products :3002 ────────► TypeORM ─► Cloud / nx_invoices
  └─► Shipping :3004
        ├─► Invoices :3005
        ├─► Users :3003
        ├─► countries.dev
        ├─► Dummy Package Place Service
        └──────────────────────────────────────► TypeORM ─► Cloud / nx_shipping
```

Each domain owns its data. Cross-service reads use explicit HTTP contracts rather than shared database access. Products remain the stock authority, Invoices owns billing snapshots and state, and Shipping owns delivery snapshots and external integrations.

The frontend keeps table pagination, search, sorting, and page size in the browser URL. URL changes drive RTK Query requests. Create, update, delete, and bulk-delete mutations update the relevant RTK Query cache directly instead of issuing an unnecessary follow-up GET.

## Shared packages

### `@nx-react-nestjs/components`

The frontend design-system package has two levels:

- `components/ui` contains ShadCN/Radix primitives such as Button, Input, Dialog, AlertDialog, Select, Table, Checkbox, RadioGroup, Tabs, and Tooltip.
- `components/app` composes those primitives into application components: AppShell, Autocomplete, DataTable, EntityDialog, ConfirmDialog, FilterSelect, LanguageSwitcher, OperationNotice, ButtonLoader, and DataFlowDiagram.

Application pages use these components instead of duplicating markup and styles. Translation state and request activity remain in the frontend because they are application behavior rather than view primitives.

### `@nx-react-nestjs/backend-utils`

The backend package is organized by responsibility:

```text
src/lib/
  bootstrap/       shared Nest application, port, and TypeORM setup
  service-discovery/
                   internal service origins resolved from ports
  crud/models/     pagination, bulk-delete, identifier, and result contracts
  repositories/
    models/        Mongo repository configuration
    implementations/
                   reusable MongoCrudRepository implementation
  external-api/
    models/        ExternalHttpClient port, request, retry, and activity models
    implementations/
                   AxiosExternalHttpClient and ExternalApiModule
  swagger/
    models/        Swagger configuration contracts
    implementations/
                   shared Swagger setup
```

`AxiosExternalHttpClient` centralizes outbound request IDs, timeouts, response-size limits, safe retries with backoff, cancellation, activity timing, and consistent NestJS upstream errors. Domain adapters provide only provider-specific URLs and response mapping.

`MongoCrudRepository` centralizes common MongoDB CRUD and list behavior while each service retains a domain-named Mongo repository responsible for entity mapping and allowed search/sort fields.

Swagger configuration is separate from Nest bootstrap and is explicitly enabled by every service.

## API documentation

| Service | API | Swagger |
| --- | --- | --- |
| Auth | `http://localhost:3001/api/auth` | `http://localhost:3001/docs` |
| Products | `http://localhost:3002/api/products` | `http://localhost:3002/docs` |
| Users | `http://localhost:3003/api/users` | `http://localhost:3003/docs` |
| Shipping | `http://localhost:3004/api/shippings` | `http://localhost:3004/docs` |
| Invoices | `http://localhost:3005/api/invoices` | `http://localhost:3005/docs` |

All Swagger interfaces are also available in the frontend under **Project Info → Swagger**.

## Environment

The root `.env` contains only service ports, Mongo Cloud connection strings, `NODE_ENV`, and `JWT_SECRET`. Internal service URLs are derived from those ports. In the browser, API origins use the current page protocol and hostname, so the same build works on localhost or a remote host without duplicated URL variables. Included credentials exist only so the demonstration workspace starts after download. Use managed secrets and disable TypeORM schema synchronization in production.

## Nx commands

```bash
npm exec nx show projects
npm exec nx graph
npm exec nx run <project>:build
npm exec nx run <project>:test
npm exec nx run-many -t build
```

Convenience commands:

```bash
npm run dev
npm run build
npm test
npm run typecheck
npm run lint
npm run seed
```

Repository-independent unit tests mock database repositories and outbound ports, so they do not require Mongo Cloud or third-party network access.
