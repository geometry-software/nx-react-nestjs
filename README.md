# Nx Monorepo

This Nx workspace contains a React frontend, four independent NestJS services, a shared UI package, and a shared infrastructure adapter package. Products owns catalog stock; Invoices owns billing snapshots and invoice state; Shipping owns delivery snapshots and tracking; Login owns users, authentication, and sessions. Services communicate through HTTP contracts rather than reading one another's databases.

## Start the workspace

Use a supported Node.js version and configure the root `.env`. Apply the [Login `Session` SQL migration](apps/login-service/sql/create-session.sql) to the configured PostgreSQL database before the first Login request. Then, from the workspace root:

```bash
npm start
```

`npm start` installs dependencies when needed, starts the frontend and four services through the Nx development targets, waits for their pages, and opens the frontend at `http://localhost:4201`. The user starts this command from their own console; repository agents follow the startup and opt-in verification policies in [AGENTS.md](AGENTS.md).

## Applications and business ownership

| Application | Default port | Owns | Details |
| --- | ---: | --- | --- |
| [Frontend](apps/frontend/README.md) | 4201 | React routes, forms, URL-driven lists, and UI composition | Domain-first frontend guide |
| [Login](apps/login-service/README.md) | 3001 | Mongo users, SQL sessions, registration, login, and email verification | Service structure and auth flow |
| [Products](apps/products-service/README.md) | 3002 | Catalog products and available stock | Native Mongo adapter and stock rules |
| [Shipping](apps/shipping-service/README.md) | 3004 | Shipments, recipient and invoice snapshots, tracking | ORM Mongo and external HTTP clients |
| [Invoices](apps/invoices-service/README.md) | 3005 | Invoice snapshots and `pending`/`complete`/`rejected` lifecycle | ORM Mongo and Products HTTP integration |

The main business path is: Products supplies product snapshots to Invoices; confirming an invoice asks Products to deduct stock; Shipping accepts only complete invoices and an active user from Login. Shipping stores its own copy of invoice, product-line, and preparer data. The frontend calls the owning APIs and generates invoice PDFs from returned invoice data.

Login follows a separate identity path. The Firebase browser SDK restores or creates an anonymous user and sends its current ID token to Login. Login verifies the token with Firebase before finding or creating a SQL `Session` for that UID. Registration creates a Mongo `User`, fills that SQL session, dispatches a verification email, and issues an application JWT. Email/password login creates another SQL session. Firebase SDK persistence is managed in the browser; the application does not store its anonymous refresh token in its own cookie or `localStorage` key.

```text
Browser / React
  ├── Login :3001 ──────► Mongo users
  │       ├──────────────► Supabase PostgreSQL Session
  │       ├──────────────► Firebase Auth token verification
  │       └──────────────► Google SMTP confirmation email
  ├── Products :3002 ───► Mongo products
  ├── Invoices :3005 ───► Mongo invoices ───HTTP──► Products
  └── Shipping :3004 ───► Mongo shipments ──HTTP──► Invoices / Login
          ├───────────────────────────────────────► countries.dev
          └───────────────────────────────────────► Dummy Package Place
```

There is no runtime Core service. `packages/geometry-sdk` provides reusable code, not a shared business database.

## Microservice structure and adapter wiring

The four service READMEs document their concrete files. A new service should first define its data ownership and HTTP dependencies, then use this structure as a reference rather than copying every folder:

```text
apps/<service>/
  README.md                 business flow, dependencies, configuration
  src/main.ts               Nest bootstrap, /api prefix, validation, error filter, Swagger
  src/app/<domain>.module.ts Nest imports, controllers, and provider bindings
  src/app/<domain>.controller.ts
  src/app/<domain>.service.ts
  src/app/entities/         domain persistence and response models
  src/app/dto/              validated request and documented response models
  src/app/providers/        adapter connection, source, token, mapping, URL settings
  src/app/adapters/         domain-facing persistence or email/Firebase wrappers
  src/app/utils/            pure calculations and normalization
  sql/                     explicit SQL schema scripts, when needed
```

`main.ts` bootstraps one Nest module. That module imports `ConfigModule` and the required SDK modules from `geometry-sdk/adapters`, such as `MongoAdapterModule.forRootAsync(configuration)`, `SqlAdapterModule.forRootAsync(configuration)`, `FireAuthAdapterModule.forRootAsync(configuration)`, or `HttpAdapterModule`. It lists controllers and binds domain adapters, services, and external client contracts as Nest providers.

Each file in `providers/` configures an SDK adapter rather than implementing business logic. A database configuration selects the implementation and connection string, identifies the collection or table `source`, registers an injection token and entity mapping, and sets search, sort, and pagination options where relevant. Product Mongo uses `implementation: 'native'`; Login users, Invoices, and Shipping use Mongo ORM; Login sessions use SQL ORM with the Supabase dialect. SQL schema synchronization is disabled, so SQL changes need explicit scripts.

A class in the service's `adapters/` injects the configured SDK adapter by token and presents domain-facing persistence operations to the service. The service orchestrates reads, rules, and writes; the controller translates HTTP DTOs into service calls and declares Swagger response models. Put side-effect-free transformations in `utils/`. For cross-service calls, define a local contract, implement it with the shared HTTP module, and bind it in the Nest module. Invoices uses a configured Products HTTP adapter; Shipping binds its invoice, user, geography, and tracking contracts to HTTP clients. A service does not import another service's repository or database connection.

For a new microservice, add its own README, update this application table and the frontend service-origin configuration if the browser calls it, and follow the applicable Nx scaffolding guidance in [AGENTS.md](AGENTS.md). Keep new repository and service methods' access modifiers explicit.

## Shared packages and frontend

`packages/geometry-sdk/components` contains reusable UI primitives, application controls, hooks, and providers. `packages/geometry-sdk/adapters` contains the collection and pagination contracts, native and ORM Mongo adapters, native and ORM SQL adapters, Firebase Auth and Firestore adapters, HTTP integration, email, file, memory, Supabase JS, error handling, and Swagger setup. See the [adapter README](packages/geometry-sdk/adapters/README.md) and [component README](packages/geometry-sdk/components/README.md) for their public APIs.

The frontend lives under `apps/frontend/src/app`: `api/` builds service URLs; `domains/` owns pages, feature hooks, validation, and RTK Query endpoints; `services/` holds shared API and Firebase-auth client services; `providers.tsx` composes application-wide providers; `utils/` contains shared calculations and PDF generation. Its [README](apps/frontend/README.md) explains the domain flow and how to add a frontend domain.

## Configuration

The root `.env` supplies configuration to all applications. Keep credentials there and out of source files.

| Concern | Environment variables |
| --- | --- |
| Service ports | `LOGIN_PORT`, `PRODUCTS_PORT`, `SHIPPING_PORT`, `INVOICES_PORT` |
| Mongo connections | `USERS_MONGODB_URI`, `PRODUCTS_MONGODB_URI`, `INVOICES_MONGODB_URI`, `SHIPPING_MONGODB_URI` |
| SQL sessions | `LOGIN_SUPABASE_SQL_URI`; apply `apps/login-service/sql/create-session.sql` |
| Login JWT | `JWT_SECRET` |
| Firebase anonymous identity | `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`, and the other `FIREBASE_*` project settings; enable Anonymous in Firebase Auth |
| Registration email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `FRONTEND_PUBLIC_URL` |
| Internal HTTP overrides | `PRODUCTS_SERVICE_URL`, `INVOICES_SERVICE_URL`, `LOGIN_SERVICE_URL`; otherwise clients use the configured local service ports |

## API documentation and Nx

Each service exposes Swagger at `/docs`: [Login](http://localhost:3001/docs), [Products](http://localhost:3002/docs), [Shipping](http://localhost:3004/docs), and [Invoices](http://localhost:3005/docs). The frontend also links them under **Project Info → Swagger**.

Use the workspace package manager and Nx for project tasks:

```bash
npm exec nx -- show projects
npm exec nx -- show project products-service
npm exec nx -- run products-service:build
npm exec nx -- run products-service:test
```

These are command examples, not automatic verification steps. Follow [AGENTS.md](AGENTS.md) before running checks or application startup.
