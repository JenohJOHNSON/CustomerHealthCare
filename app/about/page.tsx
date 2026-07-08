import SiteNav from "../components/SiteNav";

export const metadata = {
  title: "About | Customer Health Intelligence Pipeline",
  description:
    "Learn how the Customer Health Intelligence Pipeline works, including the data workflow, technology stack, and project purpose.",
};

const workflowSteps = [
  {
    title: "Collect the data",
    body: "Airbyte Cloud reads the public Telco Customer Churn CSV and loads it into Neon PostgreSQL.",
  },
  {
    title: "Store raw records",
    body: "The database keeps the original customer records in the raw schema so the pipeline has a clean starting point.",
  },
  {
    title: "Clean and prepare",
    body: "A Python script normalizes column names, converts charges and tenure into numbers, fills missing values, and creates churn-friendly features.",
  },
  {
    title: "Train the model",
    body: "Scikit-learn trains a logistic regression model that estimates each customer's probability of churn.",
  },
  {
    title: "Publish analytics",
    body: "The pipeline writes dashboard-ready tables into the analytics schema, including KPIs, predictions, and churn drivers.",
  },
  {
    title: "Explain the results",
    body: "The Vercel dashboard shows the business metrics, and the OpenAI chatbot answers questions using the analytics tables.",
  },
];

const technologies = [
  ["Airbyte Cloud", "Moves the public CSV data into PostgreSQL."],
  ["Neon PostgreSQL", "Stores raw data, cleaned data, predictions, KPIs, and pipeline history."],
  ["GitHub Actions", "Runs the Python transformation and model training workflow in the cloud."],
  ["Python", "Cleans the data and trains the churn prediction model."],
  ["pandas", "Loads, cleans, and reshapes customer records."],
  ["scikit-learn", "Builds the machine learning model."],
  ["Next.js", "Powers the dashboard pages and API routes."],
  ["Vercel", "Hosts the live web app."],
  ["OpenAI API", "Turns the analytics context into plain-English chatbot answers."],
];

export default function AboutPage() {
  return (
    <main className="page">
      <SiteNav />

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Project overview</p>
          <h1>About This Customer Health Dashboard</h1>
          <p className="lede">
            This site is a cloud data project that helps answer a practical business
            question: which customers are most likely to leave, and what patterns are
            connected to that risk?
          </p>
          <div className="actions">
            <a className="button" href="/customers">
              Explore Customers
            </a>
            <a className="button-secondary" href="/">
              Back to Dashboard
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container content-grid">
          <article className="info-panel">
            <h2>What The Site Does</h2>
            <p>
              The dashboard shows customer churn insights. Churn means a customer stops
              using a service. The project estimates churn risk, highlights high-risk
              customers, shows revenue at risk, and lists the strongest churn drivers.
            </p>
            <p>
              It is designed as a portfolio project: small enough to understand, but
              complete enough to show a real data workflow from ingestion to business
              explanation.
            </p>
          </article>

          <article className="info-panel">
            <h2>How To Read The Results</h2>
            <p>
              A high churn probability means the model found patterns that look similar
              to customers who previously churned. It is a warning signal, not a
              guarantee.
            </p>
            <p>
              The churn drivers show which features influenced the model most. They help
              explain the model, but they do not prove that one factor directly caused
              churn.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Workflow</h2>
          <div className="workflow-grid">
            {workflowSteps.map((step, index) => (
              <article className="workflow-card" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>Technology Used</h2>
            <div className="tech-list">
              {technologies.map(([name, description]) => (
                <article className="tech-item" key={name}>
                  <strong>{name}</strong>
                  <span>{description}</span>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2>Database Tables</h2>
            <div className="definition-list">
              <p>
                <strong>raw.customer_churn</strong>
                <span>Original records loaded by Airbyte.</span>
              </p>
              <p>
                <strong>analytics.customer_health</strong>
                <span>Cleaned customer records used for analysis.</span>
              </p>
              <p>
                <strong>analytics.churn_predictions</strong>
                <span>One row per customer with churn probability and risk level.</span>
              </p>
              <p>
                <strong>analytics.kpi_summary</strong>
                <span>Dashboard cards such as churn rate and revenue at risk.</span>
              </p>
              <p>
                <strong>analytics.churn_drivers</strong>
                <span>Features that most influenced the churn model.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          Built with Airbyte Cloud, Neon PostgreSQL, GitHub Actions, Python,
          Next.js, Vercel, and OpenAI.
        </div>
      </footer>
    </main>
  );
}
