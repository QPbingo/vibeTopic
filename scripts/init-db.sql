-- Runs automatically when the PostgreSQL container creates an empty database.
-- Tables do not exist yet; table-dependent triggers live in setup-db.sql.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pg_bigm";
EXCEPTION WHEN undefined_file THEN
  RAISE NOTICE 'pg_bigm is unavailable locally; search will use tsvector/ILIKE fallback';
END $$;
