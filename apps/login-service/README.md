# Login service

Login owns the user directory, registration, email verification, login, and application sessions. It runs on `LOGIN_PORT` (default `3001`). Users live in MongoDB; `Session` records live in Supabase PostgreSQL through the shared SQL ORM adapter. Firebase Auth provides anonymous browser identities, and the email adapter sends verification messages.

## Business flow

1. On frontend startup, the Firebase browser SDK restores or creates an anonymous identity and sends its current ID token to `POST /api/auth/session`. Login verifies the token with Firebase **before** finding or creating the SQL `Session` row for its UID. Firebase owns browser persistence; this service does not issue a browser refresh-token cookie.
2. Registration requires that anonymous ID token. Login creates a Mongo `User`, fills the existing SQL session with the user ID, normalized email, name, and password hash, issues an application JWT, and dispatches a verification email without waiting for delivery. `/api/auth/verify-email` records `verifiedAt` on the matching session.
3. Email/password login compares the hash from SQL, checks the Mongo user, creates a new SQL session, and issues an application JWT. `/api/auth/social` accepts Google, Facebook, or GitHub credentials for a future flow; the frontend currently uses anonymous Firebase sign-in only.
4. `/api/users` lists and reads users and supports update, single deletion, and bulk deletion. User creation happens through registration.

Swagger for both controller groups is available at `/docs`.

## Structure and adapter connection

```text
src/main.ts                 Nest bootstrap, validation, errors, Swagger
src/app/auth.module.ts       adapter modules, JWT module, controllers, providers
src/app/auth.controller.ts   session, registration, login, verification routes
src/app/users.controller.ts  user-directory routes
src/app/auth.service.ts      authentication and session use cases
src/app/users.service.ts     user-directory use cases
src/app/services/          verification email orchestration
src/app/entities/          User and Session models
src/app/dto/               HTTP request and response models
src/app/providers/         Mongo, SQL, Firebase, and email configuration
src/app/adapters/          domain-facing wrappers around SDK adapters
src/app/utils/             email normalization and template selection
sql/create-session.sql     idempotent Session table migration
```

`AuthModule` imports `MongoAdapterModule`, `SqlAdapterModule`, `FireAuthAdapterModule`, and `EmailAdapterModule` with the configurations in `providers/`. The Mongo provider reads `USERS_MONGODB_URI` and registers the ORM-backed `users` collection; `UserMongoDBAdapter` also ensures a unique email index. The SQL provider reads `LOGIN_SUPABASE_SQL_URI`, registers the `public.Session` table and its TypeORM mapping; `SessionSqlAdapter` owns session queries. The Firebase provider reads the `FIREBASE_*` settings; `LoginFirebaseAuthAdapter` verifies anonymous ID tokens with Firebase. The email provider reads `SMTP_*` settings; `LoginEmailAdapter` is used by `EmailService`. `JwtModule` reads `JWT_SECRET`.

Run [the SQL migration](sql/create-session.sql) against the configured PostgreSQL database before first use; TypeORM schema synchronization is disabled. `FRONTEND_PUBLIC_URL` controls verification links and the allowed frontend origin. See the root [README](../../README.md) for workspace setup and the full service map. Follow the root `AGENTS.md` policy before running checks or startup commands.
