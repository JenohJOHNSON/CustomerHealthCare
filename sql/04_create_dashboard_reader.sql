-- Run this while connected as the Neon owner/admin user.
-- Replace YOUR_CHOSEN_PASSWORD_HERE before running.
--
-- This user is for Vercel only. It can read dashboard tables, but it
-- cannot load raw data or replace analytics tables.

CREATE SCHEMA IF NOT EXISTS analytics;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'dashboard_reader') THEN
        ALTER USER dashboard_reader WITH PASSWORD 'YOUR_CHOSEN_PASSWORD_HERE';
    ELSE
        CREATE USER dashboard_reader WITH PASSWORD 'YOUR_CHOSEN_PASSWORD_HERE';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE "CustomerHealth" TO dashboard_reader;
GRANT USAGE ON SCHEMA analytics TO dashboard_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO dashboard_reader;

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA analytics
GRANT SELECT ON TABLES TO dashboard_reader;
