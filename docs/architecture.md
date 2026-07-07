# Architecture

The project follows the cloud workflow from the source README:

```text
Public Telco Customer Churn CSV
    -> Airbyte Cloud File Source
    -> Airbyte Connection
    -> Neon PostgreSQL
    -> GitHub Actions Python pipeline
    -> analytics tables and ML predictions
    -> Vercel Next.js dashboard
    -> OpenAI-powered Airbyte Data Chatbot
```

## Responsibilities

- Airbyte Cloud ingests the public CSV into `raw.customer_churn`.
- Neon PostgreSQL stores raw, staging, and analytics schemas.
- `scripts/transform_train.py` cleans the raw table, trains a logistic regression model, and writes customer health tables.
- GitHub Actions runs the Python pipeline on demand or daily.
- Vercel hosts the dashboard and API routes.
- OpenAI turns database summaries into business-friendly chatbot answers.

## Production hardening ideas

- Restrict database networking and avoid unnecessary public database access.
- Add model monitoring and data drift checks.
- Store raw data in S3 as a bronze layer.
- Add pgvector or SHAP only after the baseline pipeline works.
