-- Churn rate.
SELECT
    ROUND(AVG(churn_flag::numeric) * 100, 2) AS churn_rate_percent
FROM analytics.customer_health;

-- High-risk customers.
SELECT
    customerid,
    churn_probability,
    monthlycharges,
    contract,
    tenure
FROM analytics.churn_predictions
WHERE risk_level = 'High'
ORDER BY churn_probability DESC;

-- Monthly revenue at risk.
SELECT
    ROUND(SUM(monthlycharges)::numeric, 2) AS monthly_revenue_at_risk
FROM analytics.churn_predictions
WHERE risk_level = 'High';

-- Churn risk by contract type.
SELECT
    contract,
    COUNT(*) AS customers,
    ROUND(AVG(churn_probability)::numeric * 100, 2) AS avg_churn_risk_percent
FROM analytics.churn_predictions
GROUP BY contract
ORDER BY avg_churn_risk_percent DESC;

-- Top churn drivers.
SELECT
    feature,
    importance
FROM analytics.churn_drivers
ORDER BY abs_importance DESC
LIMIT 10;
