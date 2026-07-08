# Airbyte Setup

Airbyte Cloud is used only for ingestion. It moves the public CSV into Neon PostgreSQL. It does not clean the data or train the model.

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
- SSL mode: require
- SSH tunnel: No tunnel

Use the Neon owner/admin user for Airbyte because Airbyte needs to create and replace raw tables.

Do not use `dashboard_reader` for Airbyte.

## Connection

- Source: Telco CSV file
- Destination: Neon PostgreSQL
- Sync mode: Full Refresh - Overwrite
- Destination namespace/schema: `raw`
- Table name: `customer_churn`
- Primary key: `customerID`
- Cursor field: leave empty
- Schedule: manual first, daily later

## Check The Sync

After the sync, confirm the raw table exists:

```sql
SELECT COUNT(*) FROM raw.customer_churn;
```

If Airbyte creates a different table name, set the GitHub Actions variables before running the Python pipeline:

```text
RAW_SCHEMA=raw
RAW_TABLE=your_table_name
```

## Common Issues

- Neon rejects the connection if SSL mode is disabled. Use SSL mode `require`.
- Airbyte should receive the host only, not the full PostgreSQL URL.
- The password field should contain only the database password, not the full connection string.
- Use the Neon direct host for Airbyte if available.
- Use the Neon pooled host for Vercel.
