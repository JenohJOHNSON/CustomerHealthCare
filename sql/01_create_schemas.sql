CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE IF NOT EXISTS analytics.pipeline_runs (
    run_id SERIAL PRIMARY KEY,
    run_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    message TEXT
);

-- For the read-only Vercel database user, run:
-- sql/04_create_dashboard_reader.sql
