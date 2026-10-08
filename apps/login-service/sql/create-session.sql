DO $migration$
BEGIN
  IF to_regclass('public.named_sessions') IS NOT NULL THEN
    IF to_regclass('public."Session"') IS NOT NULL THEN
      RAISE EXCEPTION 'Both named_sessions and Session tables exist; resolve the conflict before migration';
    END IF;
    ALTER TABLE public.named_sessions RENAME TO "Session";
  END IF;
END
$migration$;

CREATE TABLE IF NOT EXISTS public."Session" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text,
  name text,
  email text,
  "passwordHash" text,
  "firebaseUid" text,
  "firebaseIdToken" text,
  "verifiedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Session' AND column_name = 'emailVerifiedAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Session' AND column_name = 'verifiedAt'
  ) THEN
    ALTER TABLE public."Session" RENAME COLUMN "emailVerifiedAt" TO "verifiedAt";
  END IF;
END
$migration$;

ALTER TABLE public."Session"
  ADD COLUMN IF NOT EXISTS "verifiedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "firebaseUid" text,
  ADD COLUMN IF NOT EXISTS "firebaseIdToken" text;

ALTER TABLE public."Session"
  ALTER COLUMN "userId" TYPE text USING "userId"::text,
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN "passwordHash" DROP NOT NULL;

DO $migration$
BEGIN
  IF to_regclass('public.named_sessions_email_created_at_index') IS NOT NULL
    AND to_regclass('public.session_email_created_at_index') IS NULL THEN
    ALTER INDEX public.named_sessions_email_created_at_index
      RENAME TO session_email_created_at_index;
  END IF;
END
$migration$;

CREATE INDEX IF NOT EXISTS session_email_created_at_index
  ON public."Session" (email, "createdAt" DESC);

-- Older registrations could create a second row with the same Firebase UID.
-- Keep the registered row attached to that identity without deleting session history.
WITH ranked AS (
  SELECT id, row_number() OVER (
    PARTITION BY "firebaseUid"
    ORDER BY ("userId" IS NOT NULL) DESC, "createdAt" DESC
  ) AS position
  FROM public."Session"
  WHERE "firebaseUid" IS NOT NULL
)
UPDATE public."Session" AS session
SET "firebaseUid" = NULL
FROM ranked
WHERE session.id = ranked.id AND ranked.position > 1;

CREATE UNIQUE INDEX IF NOT EXISTS session_firebase_uid_unique_index
  ON public."Session" ("firebaseUid") WHERE "firebaseUid" IS NOT NULL;

ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
