# Customer Health Intelligence Pipeline

This project predicts customer churn risk and explains customer health KPIs using a cloud-hosted data pipeline.

It is built as a portfolio-grade data project that answers:

> Which customers are likely to churn, and why?

## Live Product Features

- Executive KPI dashboard for total customers, churn rate, high-risk customers, revenue at risk, and model metrics.
- All Customer Analysis page with every customer ordered by predicted churn risk.
- About page explaining the project goal, workflow, Airbyte usage, data source, ML approach, and technology stack.
- English/French language switcher using `?lang=en` and `?lang=fr`.
- Top Churn Drivers section with clickable explanation popups for each driver.
- OpenAI-powered chatbot that answers questions using dashboard analytics context.
- Optional Airbyte sync trigger button.

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

### Architecture Layers

```text
Data Source Layer
  Public IBM Telco Customer Churn CSV

Ingestion Layer
  Airbyte Cloud File Source
  Airbyte Cloud PostgreSQL Destination

Storage Layer
  Neon PostgreSQL
  raw, staging, analytics schemas

Transformation + ML Layer
  GitHub Actions
  Python
  pandas
  scikit-learn LogisticRegression

Application Layer
  Next.js App Router
  Server-rendered dashboard pages
  API routes for chatbot and Airbyte sync trigger

Presentation Layer
  Vercel deployment
  Dashboard, Customers, About pages
  English/French UI
```

### Data Flow

1. Airbyte reads the public CSV from HTTPS.
2. Airbyte writes the raw rows into `raw.customer_churn` in Neon.
3. GitHub Actions runs `scripts/transform_train.py`.
4. Python cleans the raw table and prepares model features.
5. scikit-learn trains a logistic regression churn model.
6. The pipeline writes predictions, KPIs, and drivers into `analytics`.
7. Vercel reads analytics tables through the read-only `dashboard_reader` user.
8. The dashboard renders KPIs, customer tables, churn drivers, and explanations.
9. The chatbot uses a small analytics context and OpenAI to answer questions.

## Tools

- Airbyte Cloud for data ingestion.
- Neon PostgreSQL for cloud database storage.
- Python, pandas, and scikit-learn for cleaning, feature preparation, and churn modeling.
- SQL for schema setup, checks, and analytics queries.
- GitHub Actions for cloud pipeline execution.
- Next.js and React for the web app.
- Vercel for deployment.
- OpenAI API for the data chatbot.

## Dataset

The project uses the public IBM Telco Customer Churn CSV:

```text
https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv
```

Recommended Airbyte destination table:

```text
raw.customer_churn
```

Primary key:

```text
customerID
```

## App Pages

The app uses the Next.js App Router under the `app/` directory.

### `/`

Main dashboard with:

- KPI cards.
- Top high-risk customers.
- Top churn drivers.
- Churn driver explanation popups.
- Dashboard column guide.
- Data chatbot.
- Airbyte sync trigger.

### `/customers`

Customer analysis page with:

- Customer summary cards.
- Risk level breakdown.
- Risk by contract.
- Risk by internet service.
- Full customer table ordered by churn probability.

### `/about`

Project explanation page with:

- What the site does.
- How to read the results.
- How customer risk is calculated.
- Which ML function is used and why.
- How Airbyte is used.
- Workflow and technology stack.
- GitHub project link.
- Data source link.

## Site Layout

The application has a shared top navigation component:

```text
Customer Health | Dashboard | Customers | About | EN / FR
```

Layout structure:

```text
SiteNav
  -> language switcher
  -> dashboard/customer/about navigation

Home Dashboard (/)
  -> Hero section
  -> Executive KPI cards
  -> Top High-Risk Customers table
  -> Top Churn Drivers list
  -> Churn Driver explanation modal
  -> Dashboard Column Guide
  -> Airbyte Data Chatbot
  -> Airbyte Operations

Customer Analysis (/customers)
  -> Summary KPI cards
  -> Segment analysis tables
  -> All Customers table

About (/about)
  -> Project purpose
  -> How to read results
  -> Risk calculation
  -> ML model explanation
  -> Airbyte explanation
  -> Workflow
  -> Technology stack
  -> Database tables
```

## Repository Layout

```text
.
├── app/
│   ├── page.tsx                       # Main dashboard
│   ├── customers/page.tsx             # All Customer Analysis page
│   ├── about/page.tsx                 # Project explanation page
│   ├── api/
│   │   ├── chat/route.ts              # OpenAI chatbot API
│   │   └── airbyte-sync/route.ts      # Optional Airbyte sync trigger
│   ├── components/
│   │   ├── SiteNav.tsx                # Shared navigation + language switcher
│   │   ├── SiteLogo.tsx               # Reusable Customer Health logo mark
│   │   ├── SiteFooter.tsx             # Shared footer with portfolio profile links
│   │   ├── KpiCards.tsx               # Clickable Executive KPI explanation popups
│   │   ├── Chatbot.tsx                # Chat UI with basic bold markdown rendering
│   │   ├── ChurnDrivers.tsx           # Interactive churn-driver bar chart + popups
│   │   └── AirbyteSyncButton.tsx      # Sync trigger UI
│   ├── globals.css                    # Shared styling
│   └── layout.tsx                     # Root app layout
├── lib/
│   ├── db.ts                          # PostgreSQL connection helper
│   └── i18n.ts                        # English/French language helpers
├── scripts/
│   └── transform_train.py             # Data cleaning + ML training pipeline
├── sql/
│   ├── 01_create_schemas.sql          # Schema setup
│   ├── 02_data_quality_checks.sql     # Quality checks
│   ├── 03_useful_kpi_queries.sql      # Analysis queries
│   └── 04_create_dashboard_reader.sql # Read-only Vercel user
├── docs/
│   ├── architecture.md
│   ├── airbyte_setup.md
│   ├── cloud_deployment_guide.md
│   ├── data_model.md
│   └── interview_pitch.md
├── .github/workflows/
│   └── transform-train.yml            # GitHub Actions pipeline
├── Project Detail.txt
├── README.md
└── package.json
```

## API Routes

### `POST /api/chat`

Purpose:

- Receives a user question from the chatbot.
- Reads KPIs, top churn drivers, and sample high-risk customers from Neon.
- Sends that context to OpenAI.
- Returns a business-friendly answer.

Important environment variables:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### `POST /api/airbyte-sync`

Purpose:

- Optional endpoint used by the dashboard button.
- Starts an Airbyte sync job for the configured connection.

Important environment variables:

- `AIRBYTE_API_TOKEN`
- `AIRBYTE_CONNECTION_ID`
- `AIRBYTE_API_BASE_URL`

## Data Architecture

### Schemas

```text
raw       -> Airbyte-loaded source data
staging   -> reserved for intermediate transformations
analytics -> dashboard-ready data, predictions, KPIs, and pipeline history
```

### Main Tables

```text
raw.customer_churn
  Original Telco CSV records loaded by Airbyte.

analytics.customer_health
  Cleaned customer records with normalized fields and helper features.

analytics.churn_predictions
  Customer-level churn probability and risk level.

analytics.kpi_summary
  Metric/value rows for dashboard cards.

analytics.model_evaluation
  Test-set counts and baseline accuracy behind model KPI popups.

analytics.churn_drivers
  Logistic regression coefficients used for model explanation.

analytics.pipeline_runs
  Pipeline execution history.
```

## Frontend Design Notes

- The dashboard is intentionally simple and portfolio-friendly.
- The UI uses cards for repeated KPI and driver elements.
- Tables are horizontally scrollable so they work on smaller screens.
- The customer table is ordered by highest predicted churn probability.
- Churn-driver popups explain model features in plain language.
- The `?lang=fr` version includes accented French UI copy.
- Chatbot messages render simple `**bold**` markdown as bold text.

## How Customer Risk Is Calculated

The Python pipeline reads `raw.customer_churn`, cleans the data, and prepares features for machine learning.

Key preparation steps:

- Normalize column names.
- Convert `tenure`, `MonthlyCharges`, and `TotalCharges` into numeric values.
- Fill missing numeric values.
- Convert text categories such as `Contract`, `InternetService`, and `PaymentMethod` into model-ready columns with one-hot encoding.
- Create helper features such as `is_month_to_month` and `revenue_at_risk`.

The model uses scikit-learn `LogisticRegression` inside a pipeline. Logistic regression is used because churn is a binary classification problem: the customer either churns or does not churn. It is a good first model because it is fast, interpretable, and produces churn probabilities.

### ML Functions Used

- `train_test_split`: separates 25% of customers as unseen test data so model scores are measured fairly.
- `ColumnTransformer`: sends numeric and text columns through different preparation steps in one clean object.
- `StandardScaler`: scales numeric columns so logistic regression can compare features on a similar range.
- `OneHotEncoder`: converts text categories like contract type into numeric 0/1 columns.
- `Pipeline`: keeps preprocessing and model training together so training and prediction use the same steps.
- `LogisticRegression`: predicts churn vs no churn and returns churn probabilities plus interpretable coefficients.
- `predict`: produces the final churn/no-churn class on test rows.
- `predict_proba`: produces churn probability scores used for risk levels.
- `confusion_matrix`: counts true negatives, false positives, false negatives, and true positives.
- `accuracy_score`: measures overall correctness.
- `precision_score`: measures how often churn warnings are correct.
- `recall_score`: measures how many real churn customers were found.
- `f1_score`: balances precision and recall into one score.
- `roc_auc_score`: measures how well probabilities rank churn-risk customers above lower-risk customers.

Risk levels are assigned from the predicted churn probability:

```text
Low:    0% to less than 40%
Medium: 40% to less than 70%
High:   70% to 100%
```

## Churn Driver Popups

The model writes its strongest coefficients into `analytics.churn_drivers`.

The dashboard shows those drivers as clickable rows. Each popup explains:

- Clean readable driver name.
- Original model feature name.
- Whether the driver increases or lowers predicted churn risk.
- Why the driver matters.
- Logistic regression coefficient.
- A reminder that model drivers show association, not guaranteed cause and effect.

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

Create schemas:

```bash
psql "$DATABASE_URL" -f sql/01_create_schemas.sql
```

Create a read-only dashboard user for Vercel:

```bash
psql "$DATABASE_URL" -f sql/04_create_dashboard_reader.sql
```

If Airbyte uses another raw table name, set:

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
- `analytics.model_evaluation`
- `analytics.churn_drivers`
- `analytics.pipeline_runs`

## GitHub Actions

Add this repository secret:

```text
DATABASE_URL=postgresql://neondb_owner:PASSWORD@NEON_DIRECT_HOST/CustomerHealth?sslmode=require&channel_binding=require
```

Add these repository variables:

```text
RAW_SCHEMA=raw
RAW_TABLE=customer_churn
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

`OPENAI_API_KEY` is required only for the chatbot. The dashboard and customer analysis pages can work without OpenAI if the database is configured.

## Useful Checks

```bash
psql "$DATABASE_URL" -f sql/02_data_quality_checks.sql
psql "$DATABASE_URL" -f sql/03_useful_kpi_queries.sql
```

Manual database checks:

```sql
SELECT COUNT(*) FROM raw.customer_churn;
SELECT * FROM analytics.kpi_summary;
SELECT * FROM analytics.model_evaluation;
SELECT COUNT(*) FROM analytics.churn_predictions;
SELECT * FROM analytics.pipeline_runs ORDER BY run_time DESC;
```

## Development Checks

```bash
npm run typecheck
npm run build
```

## Repository

```text
https://github.com/JenohJOHNSON/CustomerHealthCare
```

## Limitations

This is a portfolio prototype using public demo data. A production version would need stronger security, private networking, model monitoring, data drift checks, stronger observability, and a more robust Airbyte API authentication flow.
