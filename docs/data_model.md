# Data Model

## Schemas

- `raw`: Airbyte-loaded source data.
- `staging`: reserved for intermediate transformation work.
- `analytics`: dashboard-ready tables, predictions, KPIs, churn drivers, and pipeline history.

## Source Table

### `raw.customer_churn`

The Telco Customer Churn dataset loaded by Airbyte Cloud.

Expected primary key:

```text
customerID
```

The Python pipeline normalizes this to:

```text
customerid
```

## Analytics Tables

### `analytics.customer_health`

Cleaned customer records with:

- normalized column names
- numeric charges
- numeric tenure
- `churn_flag`
- `is_month_to_month`
- `revenue_at_risk`

This table supports the `/customers` page and joins with prediction data for richer analysis.

### `analytics.churn_predictions`

One row per customer with:

- `customerid`
- `churn_probability`
- `risk_level`
- `monthlycharges`
- `contract`
- `tenure`
- `churn_flag`

Risk levels:

- `Low`: below 0.4
- `Medium`: 0.4 to below 0.7
- `High`: 0.7 to 1.0

### `analytics.kpi_summary`

Metric/value rows for dashboard cards.

Examples:

- `total_customers`
- `actual_churn_rate_percent`
- `avg_churn_probability_percent`
- `high_risk_customers`
- `monthly_revenue_at_risk`
- `model_accuracy`
- `model_precision`
- `model_recall`
- `model_f1`
- `model_roc_auc`

### `analytics.model_evaluation`

Metric/value rows that explain the basis for model KPI cards.

Examples:

- `test_rows`
- `test_actual_no_churn`
- `test_actual_churn`
- `true_negative`
- `false_positive`
- `false_negative`
- `true_positive`
- `baseline_accuracy`

### `analytics.churn_drivers`

Top logistic regression coefficients sorted by absolute importance.

Columns:

- `feature`: model feature name, such as `cat__contract_Month-to-month`
- `importance`: logistic regression coefficient
- `abs_importance`: absolute coefficient value for sorting

The dashboard uses this table for the Top Churn Drivers list and explanation popups.

### `analytics.pipeline_runs`

History table for pipeline executions.

Columns:

- `run_id`
- `run_time`
- `status`
- `message`

## App Usage

- Dashboard KPI cards read from `analytics.kpi_summary`.
- Model KPI popups read confusion-matrix details from `analytics.model_evaluation`.
- High-risk customer table reads from `analytics.churn_predictions`.
- Churn driver list and popups read from `analytics.churn_drivers`.
- All Customer Analysis joins `analytics.churn_predictions` with `analytics.customer_health`.
- Chatbot route reads KPI, driver, and high-risk customer summaries before calling OpenAI.
