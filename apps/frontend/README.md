# Frontend

The frontend is a React application in the Nx workspace. It uses Vite, React Router, RTK Query, Zod, and the shared `geometry-sdk/components` package. Its source lives in `src/app`, with business features grouped by domain.

The repository's root README covers the full workspace and how to start it. This document describes the frontend's boundaries and the steps for adding a domain. Follow the repository's `AGENTS.md` instructions for commands and verification; adding a domain does not itself authorize a build, test, or application startup.

## Where code belongs

```text
src/app/
  api/                 URL builders for backend endpoints
  domains/<domain>/
    models/            API and UI data types owned by the domain
    validation/        Zod schemas and input parsing
    service/           RTK Query endpoints and domain data hooks
    feature/           UI state and event handlers
    components/        Domain-specific presentation components
    pages/             Route components that connect a feature to its views
  hooks/               App-only hooks (currently request activity)
  locales/             Translation keys and language catalogs
  models/              App-wide types and route definitions
  services/            Shared API, request activity, and Firebase Auth client
  utils/               Shared helpers and invoice PDF generation
  providers.tsx        App-wide React provider composition
  app.tsx              Route rendering
  shell.tsx            Navigation and shared layout
```

`geometry-sdk/components` owns reusable controls, providers, and hooks. Import them from its public package entry point rather than copying them into a domain. Keep a component inside a domain when its props or behavior are specific to that domain.

## Domains and business behavior

| Domain | What the frontend does | Backend relationship |
| --- | --- | --- |
| `auth` | Lets a visitor register or log in and displays the returned application token. | Sends credentials and the current anonymous Firebase ID token to Login. |
| `users` | Lists users and supports editing, single deletion, and bulk deletion. User creation happens through registration in `auth`. | Reads and updates the user directory owned by Login. |
| `products` | Manages the catalog and available quantities. A user can select products and quantities to create an invoice. | Uses Products for catalog operations and Invoices for invoice creation. |
| `invoices` | Lists invoices, edits their descriptions, confirms or cancels pending invoices, and downloads a PDF. | Invoices owns invoice state; confirming one asks Products to deduct stock. |
| `shipping` | Creates shipments from confirmed invoices and a selected user, then shows recipient and tracking details. | Shipping resolves invoice and user data and provides location and tracking information. |
| `project-info` | Shows installation instructions, a data-flow diagram, Swagger links, and the design-system showcase. | Its Swagger page lists backend documentation; the other pages are informational. |

The frontend holds display and form state. Each backend service owns its entity rules and persistent data; the UI uses the returned records rather than trying to reproduce those rules locally.

## Data and UI flow

```text
AppProvider (API, theme, i18n, notifications, tooltips, router)
  -> App route and AppShell
    -> domain page
      -> domain feature hook (UI state, validation, notifications)
        -> domain or cross-domain service hook
          -> RTK Query endpoints on the shared ApiService
            -> backend HTTP API
      -> domain components (receive data and callbacks as props)
```

`getDataService()` in `src/app/services/data.service.ts` lazily creates one shared `ApiService` and `RequestActivityService` instance per loaded module. `AppProvider` supplies the RTK Query API to the React tree. Domain services inject endpoints into that same API; they do not create another `createApi` instance. `ApiService` tracks request activity and resolves backend origins using the current browser origin plus the ports defined in `vite.config.mts`.

Add a provider in `src/app/providers.tsx` only for application-wide behavior. Its current order is API, theme, i18n, notifications, tooltips, Firebase session, then router. The Firebase browser SDK manages the anonymous identity with IndexedDB persistence; on startup, the Firebase session provider obtains the current ID token, sends it to Login Service for verification and SQL session preparation, and keeps only the UID in React state. It shows a success notification only when a new SQL session is created. Registration sends a fresh ID token so Login Service can attach the Mongo user to that SQL session. The email/password form is handled separately through MongoDB and SQL. A new domain normally consumes these providers.

List query state lives in the URL through `useListQueryParams`. The serialized query string is the RTK Query argument and cache key. A mutation that updates a list must use the same cache key when calling `updateQueryData`; see `src/app/domains/products/service/products.service.ts` and `src/app/utils/rtk-query-cache.ts`.

## Manual for adding a domain

The `products` domain is the reference for a CRUD screen; `users` is a useful reference for edit-only behavior. Copy the flow and boundaries, not every endpoint: the Users API, for example, has no create operation.

1. **Establish the backend contract.** Identify the service origin, endpoint paths, request and response shapes, list query parameters, and which entity owns writes. Do not infer CRUD methods from another domain. If this is a new backend service, add its port to `apps/frontend/vite.config.mts` and its name to `ServiceName` in `src/app/services/api.service.ts`, as well as the corresponding backend configuration.
2. **Create the domain types.** Put entity and input types in `src/app/domains/<domain>/models/<domain>.model.ts`. Use shared `Page<TEntity>`, `EntityWriteResponse<TEntity>`, and delete response types from `src/app/models/api.model.ts` where the API follows those contracts. Keep API field names aligned with the backend.
3. **Define URLs.** Add `src/app/api/<domain>.api.ts`. Get the service origin from `getDataService().apiService.getServiceOrigin(...)`; encode dynamic path segments with `encodeURIComponent`. Follow the existing API records: string URL properties for fixed paths and functions for parameterized paths. Add a default list query constant if another flow needs it.
4. **Add the domain service.** Create `src/app/domains/<domain>/service/<domain>.service.ts`. Inject typed query and mutation endpoints into `getDataService().apiService.api`. Export the generated RTK Query hooks and a domain hook such as `useProductsService` that exposes the queries, unwrapped mutation calls, and loading states. Keep HTTP calls and list-cache updates here. Pass the exact active list query as `cacheKey` for cache writes.
5. **Add validation and the feature hook.** Put Zod schemas in `validation/`, using translated messages where the form needs them. In `feature/`, combine the domain service with URL query hooks, selection, dialog state, `useI18n`, and `useNotification`. Use `executeRequest` for mutation failures. Invalid fields should get a border and a small field message; show a form-level validation notification without changing label color. Query failures should use `useQueryErrorNotification` with a retry action.
6. **Build the presentation.** Add small domain components for header, filters, table, and dialogs as needed. Pass data, loading state, translation, and handlers from the feature hook through the page; components should not initiate backend requests. Reuse controls and shared hooks from `geometry-sdk/components`.
7. **Register the route.** Add a lazy page entry to `src/app/models/navigation.model.ts`. For a URL-driven list, add the route to `src/app/utils/navigation.ts` and use its `path` and `href` in the navigation record. `src/app/app.tsx` renders `appRoutes`; `src/app/shell.tsx` reads the same record for navigation and breadcrumbs.
8. **Add translations.** Add keys to `src/app/locales/locale.ts` and messages to every catalog: `en.locale.ts`, `es.locale.ts`, and `pt.locale.ts`. Use `translate(...)` for visible text, notifications, validation messages, and accessible labels.
9. **Review connections.** Check the route, backend port, API URL builder, shared API injection, cache key, provider needs, locale keys, and cross-domain dependencies together. For a workflow involving multiple domains, use a composition service such as `src/app/domains/products/service/product-invoice.service.ts` and keep pure calculations in `src/app/utils/`. Follow the repository's opt-in verification policy when deciding whether to run any checks.

The resulting files should normally look like this:

```text
src/app/api/<domain>.api.ts
src/app/domains/<domain>/models/<domain>.model.ts
src/app/domains/<domain>/validation/<domain>.validation.ts
src/app/domains/<domain>/service/<domain>.service.ts
src/app/domains/<domain>/feature/<domain>.feature.ts
src/app/domains/<domain>/components/*.tsx
src/app/domains/<domain>/pages/<domain>.page.tsx
```

## Utilities

`src/app/utils/` contains helpers used across the frontend. `product-invoice.ts` holds pure invoice calculations and input assembly; `invoice-report.ts` creates the PDF used by both the Products and Invoices features. PDF generation is a browser side effect called from a feature, while backend requests and RTK Query cache updates remain in services.
