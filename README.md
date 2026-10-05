# NX Monorepo

An Nx workspace containing a multilingual end-to-end React application, four independent NestJS microservices, shared components, and backend adapters. The project demonstrates domain-owned APIs, service-to-service communication, URL-driven tables and other data flow.

## Technology

Nx 23 · React 19 · Vite · RTK Query · Zod · Tailwind CSS 4 · ShadCN/Radix · NestJS 12 · TypeORM · MongoDB Atlas · Swagger/OpenAPI · Vitest

## Getting started

Install a supported version of [Node.js](https://nodejs.org/en/download), download and unpack the [repository](https://github.com/geometry-software/nx-react-nestjs), then open a terminal in the extracted directory.

```bash
npm start
```

This single command installs dependencies, starts the complete workspace, and opens [http://localhost:4201](http://localhost:4201). The application uses a demonstration MongoDB Atlas environment, so database does not need to be installed locally.

## Workspace

```text
apps/
  frontend/          React application                                :4201
    src/app/domains/ domain-first frontend modules
    services/        shared RTK Query API, cache, and activity services
      */pages/       domain route presentation and layout
      */feature/     domain hooks, state, effects, and event handlers
      */service/     domain RTK Query endpoint definitions
  login-service/     authentication, users, roles, and JWT            :3001
  products-service/  catalog, pricing, and stock                      :3002
  shipping-service/  shipments, recipients, and tracking              :3004
  invoices-service/  invoice lifecycle and stock confirmation         :3005

packages/
  geometry-sdk/      public SDK facade
    components/      shared frontend design system
    adapters/        shared infrastructure and repository adapters

scripts/
  open-demo.mjs      installs, starts, and opens the workspace
  mock.sh            loads demonstration products and users
```

## Frontend

The React frontend organizes catalog, invoices, shipping, users, and authentication by domain. Each domain connects its pages and components to feature hooks and RTK Query services, while shared providers and the `geometry-sdk/components` package supply common application behavior and UI controls. See the [frontend README](apps/frontend/README.md) for the folder layout, business flows, and a guide to adding a domain.

## Microservices

### Login service

Owns registration, login, the user directory, and roles. It validates credentials, stores authentication records, issues JWTs, and exposes user read, update, single-delete, and bulk-delete operations. The user directory does not expose a create endpoint; account creation remains part of registration. Authentication records and the user directory retain separate MongoDB Atlas databases and repositories inside the same service. Catalog and operational domains are intentionally not protected by this service in the demonstration application.

### Products service

Owns product names, descriptions, inventory identifiers, prices, and available quantities. It provides CRUD, bulk deletion, product snapshot resolution, and atomic stock deduction used when an invoice is confirmed.

### Invoices service

Creates invoices from selected products and stores immutable product name, description, price, and quantity snapshots. An invoice moves through `pending`, `complete`, or `rejected` states. Confirming an invoice asks Products to validate and deduct stock; cancelling it marks the invoice as rejected. Invoice printing is initiated by the frontend from the stored invoice data.

### Shipping service

Creates shipments from confirmed invoices and a selected user. It resolves invoice snapshots from Invoices, resolves the preparer from the Auth user directory, generates a tracking number after creation, and stores recipient, invoice, product-line, and tracking snapshots. It also exposes location lookup and tracking refresh operations.

Shipping is the only service that communicates with third-party providers:

- `countries.dev` supplies country and dependent city suggestions.
- `Dummy Package Place Service` supplies demonstration tracking events with synthetic dates and statuses. It is not a real carrier integration.

All services have their own controllers, domain services, DTOs, entities, and Mongo-specific repositories. There is no runtime Core microservice.

## Data flow

```text
React :4201
  ├─► Login :3001 ─┬────────────────────────────► TypeORM ─► Cloud / nx_auth
  │                └────────────────────────────► TypeORM ─► Cloud / nx_users
  ├─► Products :3002 ──────────────────────────► TypeORM ─► Cloud / nx_products
  ├─► Invoices :3005 ──────────────────────────► TypeORM ─► Cloud / nx_invoices
  └─► Shipping :3004 ──────────────────────────► TypeORM ─► Cloud / nx_shipping
    ├─► countries.dev
    └─► Dummy Package Place Service
```

Each domain owns its data. Auth owns credentials and the user directory through separate repositories. Cross-service reads use explicit HTTP contracts rather than shared database access. Products remain the stock authority, Invoices owns billing snapshots and state, and Shipping owns delivery snapshots and external integrations.

The frontend uses domain-first modules under `src/app/domains`. Every section owns a `pages` presentation layer and a `feature` hook layer; API-backed domains additionally own a `service` with injected RTK Query endpoints. The shared `domains/api.ts` defines the single base API, HTTP request methods, service-port resolution, and cache helpers. Table pagination, search, sorting, and page size remain in the browser URL, and URL changes drive RTK Query requests. Create, update, delete, and bulk-delete mutations update the relevant RTK Query cache directly instead of issuing an unnecessary follow-up GET.

## Shared packages

### `geometry-sdk/components`

The frontend design-system package has two levels:

- `components/ui` contains ShadCN/Radix primitives such as Button, Input, Dialog, AlertDialog, Select, Table, Checkbox, RadioGroup, Tabs, and Tooltip.
- `components/app` composes those primitives into application components: Autocomplete, DataTable, Entity and Confirm dialogs.

Application pages use these components instead of duplicating markup and styles. Translation configuration and request activity remain in the frontend because they are application behavior rather than view primitives.

React context providers and shared frontend API response types are exposed through `geometry-sdk/components` together with the rest of the frontend package.

### `geometry-sdk/adapters`

The shared infrastructure package is organized by responsibility. Nest services use its Swagger adapter to publish OpenAPI documentation, while the frontend uses the browser-safe Swagger adapter to resolve those documentation endpoints:

```text
src/adapters/
  core/            framework-independent repository contracts
  http/            Axios client, external HTTP models, and service discovery
  file/            structured filesystem adapter
  memory/          process-local repository adapter
  mongodb/         TypeORM MongoDB adapters and reusable CRUD repository
  firebase/        Firestore repository adapter
  supabase/        PostgREST repository adapter
  nest/            NestJS bootstrap, DTOs, DI, and Swagger integration
  pdf/             PDF report adapters
  swagger/         browser documentation URL adapte, separated from Nest bootstrap and is explicitly enabled by every service.
```

## API documentation

| Service | API | Swagger |
| --- | --- | --- |
| Login | `http://localhost:3001/api/auth`, `http://localhost:3001/api/users` | `http://localhost:3001/docs` |
| Products | `http://localhost:3002/api/products` | `http://localhost:3002/docs` |
| Shipping | `http://localhost:3004/api/shippings` | `http://localhost:3004/docs` |
| Invoices | `http://localhost:3005/api/invoices` | `http://localhost:3005/docs` |

All Swagger interfaces are also available in the frontend under **Project Info → Swagger**.

## Environment

The root `.env` contains only service ports, MongoDB connection strings, `NODE_ENV`, and `JWT_SECRET`. Internal service URLs are derived from those ports. In the browser, API origins use the current page protocol and hostname, so the same build works on localhost or a remote host without duplicated URL variables. Included credentials exist only so the demonstration workspace starts after download. Use managed secrets and disable TypeORM schema synchronization in production.

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
