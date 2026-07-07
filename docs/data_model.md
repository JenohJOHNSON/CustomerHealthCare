# Data Model

## Schemas

- `raw`: Airbyte-loaded source data.
- `staging`: reserved for intermediate transformation work.
- `analytics`: dashboard-ready tables, predictions, KPIs, and pipeline history.

## Tables

### `raw.customer_churn`

The source Telco churn dataset loaded by Airbyte.

### `analytics.customer_health`

Cleaned customer records with normalized column names, numeric charges, `churn_flag`, and business features such as `is_month_to_month` and `revenue_at_risk`.

### `analytics.churn_predictions`

One row per customer with:

- `customerid`
- `churn_probability`
- `risk_level`
- `monthlycharges`
- `contract`
- `tenure`
- `churn_flag`

### `analytics.kpi_summary`

Metric/value rows for dashboard cards, including churn rate, high-risk customers, revenue at risk, and model metrics.

### `analytics.churn_drivers`

Top logistic regression coefficients sorted by absolute importance.

### `analytics.pipeline_runs`

History table for successful pipeline executions.
