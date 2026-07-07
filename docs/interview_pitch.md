# Interview Pitch

I built a cloud-hosted project called Customer Health Intelligence Pipeline. The goal is to predict customer churn risk and explain the main drivers behind customer dissatisfaction.

The data is ingested with Airbyte Cloud from a public customer churn dataset into Neon PostgreSQL. A Python pipeline runs in GitHub Actions to clean the raw data, create customer health features, train a churn prediction model, and write KPIs and predictions back to PostgreSQL.

The final result is hosted on Vercel as a dashboard. It shows overall churn rate, high-risk customers, revenue at risk, and the top churn drivers. I also added an Airbyte Data Chatbot that answers business questions using the data loaded by Airbyte.

This project demonstrates the full data workflow: ingestion, cloud storage, SQL, Python transformation, machine learning, dashboarding, and business interpretation.
