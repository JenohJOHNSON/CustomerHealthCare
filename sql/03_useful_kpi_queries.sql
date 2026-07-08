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

-- Churn risk by internet service.
SELECT
    COALESCE(h.internetservice, 'Unknown') AS internetservice,
    COUNT(*) AS customers,
    ROUND(AVG(p.churn_probability)::numeric * 100, 2) AS avg_churn_risk_percent,
    ROUND(COALESCE(SUM(p.monthlycharges) FILTER (WHERE p.risk_level = 'High'), 0)::numeric, 2) AS monthly_revenue_at_risk
FROM analytics.churn_predictions p
LEFT JOIN analytics.customer_health h USING (customerid)
GROUP BY COALESCE(h.internetservice, 'Unknown')
ORDER BY avg_churn_risk_percent DESC;

-- Risk level breakdown.
SELECT
    risk_level,
    COUNT(*) AS customers,
    ROUND(AVG(churn_probability)::numeric * 100, 2) AS avg_churn_risk_percent,
    ROUND(COALESCE(SUM(monthlycharges) FILTER (WHERE risk_level = 'High'), 0)::numeric, 2) AS monthly_revenue_at_risk
FROM analytics.churn_predictions
GROUP BY risk_level
ORDER BY
    CASE risk_level
        WHEN 'High' THEN 1
        WHEN 'Medium' THEN 2
        ELSE 3
    END;

-- Top churn drivers.
SELECT
    feature,
    importance,
    abs_importance
FROM analytics.churn_drivers
ORDER BY abs_importance DESC
LIMIT 10;

-- All customer analysis table.
SELECT
    p.customerid,
    p.risk_level,
    ROUND(p.churn_probability::numeric * 100, 2) AS churn_probability_percent,
    p.monthlycharges,
    h.totalcharges,
    p.contract,
    p.tenure,
    h.churn,
    h.internetservice,
    h.paymentmethod
FROM analytics.churn_predictions p
LEFT JOIN analytics.customer_health h USING (customerid)
ORDER BY p.churn_probability DESC, p.monthlycharges DESC
LIMIT 100;
