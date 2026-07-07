-- Check raw row count after Airbyte sync.
SELECT COUNT(*) AS row_count
FROM raw.customer_churn;

-- Check duplicate customers after transformation.
SELECT customerid, COUNT(*) AS customer_records
FROM analytics.customer_health
GROUP BY customerid
HAVING COUNT(*) > 1;

-- Check churn values.
SELECT churn, COUNT(*) AS customers
FROM analytics.customer_health
GROUP BY churn
ORDER BY customers DESC;

-- Check missing customer IDs.
SELECT COUNT(*) AS missing_customer_ids
FROM analytics.customer_health
WHERE customerid IS NULL OR customerid = '';

-- Check impossible monthly charges.
SELECT COUNT(*) AS negative_monthly_charges
FROM analytics.customer_health
WHERE monthlycharges < 0;

-- Check pipeline history.
SELECT run_id, run_time, status, message
FROM analytics.pipeline_runs
ORDER BY run_time DESC
LIMIT 10;
