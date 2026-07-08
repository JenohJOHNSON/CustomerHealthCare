# Interview Pitch

I built a cloud-hosted project called Customer Health Intelligence Pipeline. The goal is to predict customer churn risk and explain the main drivers behind customer dissatisfaction.

The data is ingested with Airbyte Cloud from a public Telco customer churn CSV into Neon PostgreSQL. Airbyte handles the ingestion step only: it reads the HTTPS CSV file and writes raw records into `raw.customer_churn`.

A Python pipeline runs in GitHub Actions. It cleans the raw data, creates customer health features, trains a scikit-learn logistic regression model, and writes KPIs, predictions, churn drivers, and pipeline history back to PostgreSQL.

The final result is hosted on Vercel as a Next.js dashboard. It includes an executive dashboard, an all-customer analysis page, an about page, English/French language switching, and clickable popups that explain each top churn driver.

The dashboard shows total customers, churn rate, high-risk customers, revenue at risk, model metrics, and the strongest churn drivers. The customer analysis page lets users inspect each customer by churn probability, risk level, contract, tenure, charges, internet service, and payment method.

The model uses logistic regression because churn is a binary classification problem: a customer either churns or does not churn. Logistic regression is fast, interpretable, and produces probabilities, which makes it a good fit for a business-facing portfolio dashboard.

I also added an OpenAI-powered data chatbot that answers business questions using the analytics tables. If OpenAI quota is unavailable, the dashboard still works because the core analytics are stored in Neon.

This project demonstrates the full modern data workflow: ingestion, cloud storage, SQL, Python transformation, machine learning, dashboarding, business interpretation, and cloud deployment.
