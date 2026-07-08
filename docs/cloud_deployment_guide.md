# Cloud Deployment Guide

This guide connects GitHub, Neon, Airbyte Cloud, and Vercel for the Customer Health Intelligence Pipeline.

## Final Cloud Flow

```text
Public Telco CSV
  -> Airbyte Cloud
  -> Neon PostgreSQL
  -> GitHub Actions Python pipeline
  -> Vercel Next.js app
```

## 1. Create The Neon Database

What to do:

- Use the existing `CustomerHealth` Neon database.
- Keep the owner/admin role for setup, Airbyte, and GitHub Actions.
- Create `raw`, `staging`, and `analytics` schemas.

Why it matters:

- Airbyte and the Python pipeline need write access.
- The deployed dashboard should only read analytics data.

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
- Forgetting `sslmode=require` in connection strings.

## 2. Create The Vercel Read-Only Database User

What to do:

- Open `sql/04_create_dashboard_reader.sql`.
- Replace `YOUR_CHOSEN_PASSWORD_HERE` with your own password.
- Run the SQL in Neon as the owner/admin user.

Why it matters:

- Vercel should be able to read dashboard tables.
- Vercel should not be able to load raw data or replace analytics tables.

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
- Thinking the script failed if the user already existed. The script is safe to run again and updates the password.

## 3. Load Raw Data With Airbyte Cloud

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
Username: neondb_owner
Default schema: raw
SSL mode: require
SSH tunnel: No tunnel
```

Connection settings:

```text
Sync mode: Full Refresh - Overwrite
Destination namespace/schema: raw
Table name: customer_churn
Primary key: customerID
Cursor field: blank
```

Check:

```sql
SELECT COUNT(*) FROM raw.customer_churn;
```

Common mistakes:

- Leaving SSL mode disabled. Neon requires SSL.
- Pasting the full PostgreSQL URL into Airbyte's Host field.
- Putting the full PostgreSQL URL in the Password field.
- Letting Airbyte create a different table name without updating `RAW_TABLE`.
- Using `dashboard_reader` for Airbyte.

## 4. Run The Python Pipeline In GitHub Actions

What to do:

- Add GitHub Actions secrets and variables.
- Run the `Transform and Train` workflow.

Why it matters:

- This cleans the raw data.
- This trains the logistic regression churn model.
- This creates dashboard-ready analytics tables.

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
- Forgetting to use the Neon owner/admin URL for the pipeline.

## 5. Deploy The Dashboard On Vercel

What to do:

- Import the GitHub repository into Vercel.
- Add Vercel environment variables.
- Deploy the app.

Why it matters:

- This gives you the live dashboard, customer analysis page, about page, chatbot, and bilingual UI.

Tools or files:

- Vercel
- `package.json`
- `app/page.tsx`
- `app/customers/page.tsx`
- `app/about/page.tsx`

Vercel environment variables:

```text
DATABASE_URL=your dashboard_reader Neon pooled connection string
OPENAI_API_KEY=your OpenAI API key
OPENAI_MODEL=gpt-4.1-mini
AIRBYTE_API_TOKEN=your Airbyte API token
AIRBYTE_CONNECTION_ID=your Airbyte connection id
AIRBYTE_API_BASE_URL=https://api.airbyte.com/v1
```

Notes:

- `DATABASE_URL` should use `dashboard_reader`, not `neondb_owner`.
- `OPENAI_API_KEY` is required only for chatbot answers.
- The dashboard and customer pages can still work if OpenAI quota is unavailable.
- If OpenAI returns `insufficient_quota`, add API billing/credits in OpenAI Platform and redeploy Vercel.

Check:

- The Vercel deployment succeeds.
- `/` shows KPI cards.
- `/customers` shows the all-customer analysis table.
- `/about` explains the workflow and ML model.
- `/?lang=fr`, `/customers?lang=fr`, and `/about?lang=fr` show French UI text.
- Clicking a Top Churn Driver opens an explanation popup.
- The chatbot answers questions when OpenAI quota is available.

Common mistakes:

- Forgetting to redeploy after adding environment variables.
- Using the owner/admin database URL in Vercel.
- Expecting ChatGPT Plus to provide OpenAI API credits. API billing is separate.

## 6. Final Demo Checklist

Before presenting the project:

- Run Airbyte sync successfully.
- Run GitHub Actions `Transform and Train` successfully.
- Confirm `analytics.kpi_summary` has rows.
- Confirm `analytics.churn_predictions` has rows.
- Open the Vercel dashboard.
- Click at least one churn driver popup.
- Open `/customers`.
- Open `/about`.
- Test `?lang=fr`.
- Ask the chatbot a simple question, such as `What is the churn rate?`.
