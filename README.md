# Customer Health Intelligence Pipeline

This project predicts customer churn risk and explains customer health KPIs using a cloud-hosted data pipeline.

## Project Goal

Build a portfolio-grade data project that answers:

> Which customers are likely to churn, and why?

The final dashboard shows total customers, churn rate, high-risk customers, revenue at risk, top churn drivers, and an Airbyte Data Chatbot.

## Architecture

```text
Public Telco CSV
  -> Airbyte Cloud File Source
  -> Neon PostgreSQL
  -> GitHub Actions Python pipeline
  -> analytics tables and ML predictions
  -> Vercel Next.js dashboard
  -> OpenAI-powered chatbot
```

## Tools

- Airbyte Cloud
- Neon PostgreSQL
- Python, pandas, scikit-learn
- SQL
- GitHub Actions
- Next.js
- Vercel
- OpenAI API

## Dataset

Use the public Telco Customer Churn CSV:

```text
https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv
```

## Local Setup

Install JavaScript dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Run the app:

```bash
npm run dev
```

The app can start without `DATABASE_URL`; it will show setup guidance until the PostgreSQL analytics tables exist.

## Database Setup

Use the Neon owner/admin connection string for setup and pipeline writes.

Create the schemas:

```bash
psql "$DATABASE_URL" -f sql/01_create_schemas.sql
```

Create a read-only dashboard user for Vercel:

```bash
psql "$DATABASE_URL" -f sql/04_create_dashboard_reader.sql
```

Configure Airbyte Cloud to load the Telco CSV into:

```text
raw.customer_churn
```

If Airbyte uses another table name, set:

```bash
RAW_SCHEMA=raw
RAW_TABLE=your_table_name
```

## Python Pipeline

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run the transformation and model training:

```bash
export DATABASE_URL="postgresql://neondb_owner:PASSWORD@NEON_DIRECT_HOST/CustomerHealth?sslmode=require&channel_binding=require"
python scripts/transform_train.py
```

The script creates:

- `analytics.customer_health`
- `analytics.churn_predictions`
- `analytics.kpi_summary`
- `analytics.churn_drivers`
- `analytics.pipeline_runs`

## GitHub Actions

Add this repository secret:

```text
DATABASE_URL=postgresql://neondb_owner:PASSWORD@NEON_DIRECT_HOST/CustomerHealth?sslmode=require&channel_binding=require
```

Then run the `Transform and Train` workflow manually or let it run on the daily schedule.

## Vercel Environment Variables

Use a read-only PostgreSQL user for Vercel.

```text
DATABASE_URL=postgresql://dashboard_reader:PASSWORD@NEON_POOLER_HOST/CustomerHealth?sslmode=require&channel_binding=require
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
AIRBYTE_API_TOKEN=your_airbyte_api_token
AIRBYTE_CONNECTION_ID=your_airbyte_connection_id
AIRBYTE_API_BASE_URL=https://api.airbyte.com/v1
```

## Useful Checks

```bash
psql "$DATABASE_URL" -f sql/02_data_quality_checks.sql
psql "$DATABASE_URL" -f sql/03_useful_kpi_queries.sql
```

## Limitations

This is a portfolio prototype using public demo data. A production system would need stronger security, private networking, orchestration, monitoring, and model drift checks.
