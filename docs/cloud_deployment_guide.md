# Cloud Deployment Guide

This guide connects GitHub, Neon, Airbyte Cloud, and Vercel.

## 1. Create the Neon database

What to do:

- Use the existing `CustomerHealth` Neon database.
- Keep the owner/admin role for setup, Airbyte, and GitHub Actions.

Why it matters:

- Airbyte and the Python pipeline need write access.
- The deployed dashboard should only read data.

Tools or files:

- Neon SQL Editor
- `sql/01_create_schemas.sql`
- `sql/04_create_dashboard_reader.sql`

Commands:

```sql
CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS analytics;
```

Check:

```sql
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name IN ('raw', 'staging', 'analytics');
```

Common mistakes:

- Using the Vercel read-only user for setup.
- Using the wrong database name. This project expects `CustomerHealth`.

## 2. Create the Vercel read-only database user

What to do:

- Open `sql/04_create_dashboard_reader.sql`.
- Replace `YOUR_CHOSEN_PASSWORD_HERE` with your own password.
- Run the SQL in Neon as the owner/admin user.

Why it matters:

- Vercel should not be able to delete, replace, or load data.

Tools or files:

- Neon SQL Editor
- `sql/04_create_dashboard_reader.sql`

Check:

```sql
SELECT rolname FROM pg_roles WHERE rolname = 'dashboard_reader';
```

Common mistakes:

- Forgetting to replace the password placeholder.
- Using password characters like `@`, `/`, `#`, or `:` without URL-encoding them in the connection string.
- Thinking the script failed if the user already existed. The script is safe to run again and will update the password.

## 3. Load raw data with Airbyte Cloud

What to do:

- Create a File source for the public Telco CSV.
- Create a PostgreSQL destination pointing to Neon.
- Create a connection from the source to the destination.

Why it matters:

- This creates the raw table that the Python model reads.

Tools or files:

- Airbyte Cloud
- `docs/airbyte_setup.md`

Source settings:

```text
Dataset name: customer_churn
File format: CSV
Storage provider: HTTPS Public Web
URL: https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv
```

Destination settings:

```text
Host: your Neon direct host
Port: 5432
Database: CustomerHealth
Default schema: raw
SSL: require
```

Check:

```sql
SELECT COUNT(*) FROM raw.customer_churn;
```

Common mistakes:

- Letting Airbyte create a table with a different name.
- Using `dashboard_reader` for Airbyte. Airbyte needs write access.

## 4. Run the Python pipeline in GitHub Actions

What to do:

- Add GitHub Actions secrets and variables.
- Run the `Transform and Train` workflow.

Why it matters:

- This cleans the raw data, trains the churn model, and creates dashboard tables.

Tools or files:

- GitHub repository settings
- `.github/workflows/transform-train.yml`
- `scripts/transform_train.py`

GitHub secret:

```text
DATABASE_URL=your Neon owner/admin direct connection string
```

GitHub variables:

```text
RAW_SCHEMA=raw
RAW_TABLE=customer_churn
```

Check:

```sql
SELECT * FROM analytics.kpi_summary;
SELECT COUNT(*) FROM analytics.churn_predictions;
SELECT * FROM analytics.pipeline_runs ORDER BY run_time DESC;
```

Common mistakes:

- Putting the read-only Vercel URL in GitHub Actions.
- Running the workflow before Airbyte has loaded `raw.customer_churn`.

## 5. Deploy the dashboard on Vercel

What to do:

- Import the GitHub repository into Vercel.
- Add Vercel environment variables.
- Deploy the app.

Why it matters:

- This gives you a live web dashboard.

Tools or files:

- Vercel
- `package.json`
- `app/page.tsx`

Vercel environment variables:

```text
DATABASE_URL=your dashboard_reader Neon pooled connection string
OPENAI_API_KEY=your OpenAI API key
OPENAI_MODEL=gpt-4.1-mini
AIRBYTE_API_TOKEN=your Airbyte API token
AIRBYTE_CONNECTION_ID=your Airbyte connection id
AIRBYTE_API_BASE_URL=https://api.airbyte.com/v1
```

Check:

- The Vercel deployment succeeds.
- The dashboard shows KPI cards.
- The high-risk customer table has rows.
- The chatbot answers questions about the dashboard data.

Common mistakes:

- Forgetting to redeploy after adding environment variables.
- Using the owner/admin database URL in Vercel.
