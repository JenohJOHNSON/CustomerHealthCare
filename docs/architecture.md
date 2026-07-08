# Architecture

The project follows this cloud workflow:

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
- `scripts/transform_train.py` cleans the raw table, trains a logistic regression model, and writes dashboard-ready analytics tables.
- GitHub Actions runs the Python pipeline manually or on the daily schedule.
- Vercel hosts the Next.js app, dashboard pages, and API routes.
- OpenAI turns database summaries into business-friendly chatbot answers.

## Application Pages

- `/`: Executive dashboard with KPIs, high-risk customers, churn drivers, driver explanation popups, chatbot, and Airbyte sync button.
- `/customers`: All-customer analysis page with customer-level risk table and segment analysis.
- `/about`: Project explanation page with workflow, technology stack, ML explanation, Airbyte explanation, GitHub link, and data source link.

## Language Support

The app supports English and French through a query parameter:

```text
?lang=en
?lang=fr
```

The navigation, dashboard labels, customer analysis labels, chatbot UI, Airbyte sync UI, and explanatory content support both languages.

## Model Flow

1. Read `raw.customer_churn`.
2. Expand Airbyte payloads if needed.
3. Normalize columns.
4. Convert numeric values.
5. Clean text values.
6. Create churn label and helper features.
7. Train a scikit-learn logistic regression model.
8. Write predictions, KPIs, and churn drivers to `analytics`.

## Churn Driver Explanations

The top driver list uses rows from `analytics.churn_drivers`. Each driver row opens a popup explaining:

- readable driver name
- original model feature name
- coefficient
- whether the driver increases or lowers churn risk
- plain-English/French business meaning

## Production Hardening Ideas

- Rotate credentials that were ever pasted into chat or screenshots.
- Restrict database networking where possible.
- Add model monitoring and data drift checks.
- Add more robust Airbyte API authentication for the sync button.
- Store raw data in object storage as a bronze layer.
- Add SHAP or another explainability library after the baseline pipeline works.
