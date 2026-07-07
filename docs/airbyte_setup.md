# Airbyte Setup

## Source

Create an Airbyte Cloud File source.

- Dataset name: `customer_churn`
- File format: CSV
- Storage provider: HTTPS Public Web
- URL: `https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv`

## Destination

Create a PostgreSQL destination pointing at Neon.

- Host: your Neon direct host
- Port: `5432`
- Database: `CustomerHealth`
- Username: `neondb_owner`
- Default schema: `raw`
- SSL: require

## Connection

- Source: Telco CSV file
- Destination: Neon PostgreSQL
- Sync mode: Full Refresh - Overwrite
- Destination namespace: `raw`
- Table name: `customer_churn`
- Schedule: manual first, daily later

After the sync, confirm:

```sql
SELECT COUNT(*) FROM raw.customer_churn;
```

If Airbyte creates a different table name, set `RAW_SCHEMA` and `RAW_TABLE` before running the Python pipeline.
