import AirbyteSyncButton from "./components/AirbyteSyncButton";
import Chatbot from "./components/Chatbot";
import SiteNav from "./components/SiteNav";
import { hasDatabaseUrl, query } from "@/lib/db";

export const dynamic = "force-dynamic";

type KpiRow = {
  metric: string;
  value: string | number;
};

type CustomerRow = {
  customerid: string;
  churn_probability: string | number;
  risk_level: string;
  monthlycharges: string | number;
  contract: string;
  tenure: string | number;
};

type DriverRow = {
  feature: string;
  importance: string | number;
};

type DashboardData = {
  configured: boolean;
  error?: string;
  kpis: KpiRow[];
  highRiskCustomers: CustomerRow[];
  drivers: DriverRow[];
};

function formatMetricName(metric: string) {
  return metric.replaceAll("_", " ");
}

function formatMetricValue(metric: string, value: string | number) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  if (metric.includes("percent")) {
    return `${numericValue.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}%`;
  }

  if (metric.includes("revenue")) {
    return numericValue.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  if (metric.startsWith("model_")) {
    return numericValue.toFixed(3);
  }

  return numericValue.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function percent(value: string | number) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "n/a";

  return `${Math.round(numericValue * 100)}%`;
}

function money(value: string | number) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "n/a";

  return numericValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function driverStrength(driver: DriverRow, maxImportance: number) {
  const importance = Math.abs(Number(driver.importance));

  if (!maxImportance || !Number.isFinite(importance)) {
    return "0%";
  }

  return `${Math.max(8, Math.round((importance / maxImportance) * 100))}%`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown database error";
}

async function getDashboardData(): Promise<DashboardData> {
  if (!hasDatabaseUrl()) {
    return {
      configured: false,
      kpis: [],
      highRiskCustomers: [],
      drivers: [],
    };
  }

  try {
    const [kpis, highRiskCustomers, drivers] = await Promise.all([
      query<KpiRow>(`
        SELECT metric, value
        FROM analytics.kpi_summary
        ORDER BY metric
      `),
      query<CustomerRow>(`
        SELECT customerid, churn_probability, risk_level, monthlycharges, contract, tenure
        FROM analytics.churn_predictions
        WHERE risk_level = 'High'
        ORDER BY churn_probability DESC
        LIMIT 10
      `),
      query<DriverRow>(`
        SELECT feature, importance
        FROM analytics.churn_drivers
        ORDER BY abs_importance DESC
        LIMIT 10
      `),
    ]);

    return {
      configured: true,
      kpis: kpis.rows,
      highRiskCustomers: highRiskCustomers.rows,
      drivers: drivers.rows,
    };
  } catch (error) {
    return {
      configured: true,
      error: getErrorMessage(error),
      kpis: [],
      highRiskCustomers: [],
      drivers: [],
    };
  }
}

export default async function HomePage() {
  const data = await getDashboardData();
  const maxDriverImportance = Math.max(
    0,
    ...data.drivers.map((driver) => Math.abs(Number(driver.importance)) || 0),
  );

  return (
    <main className="page">
      <SiteNav />

      <section className="hero">
        <div className="container hero-inner">
          <div>
            <p className="eyebrow">Airbyte Cloud + Neon + ML + Vercel</p>
            <h1>Customer Health Intelligence Pipeline</h1>
            <p className="lede">
              A cloud data project that ingests public Telco churn data, trains a churn
              model, writes customer health analytics back to PostgreSQL, and presents
              the insights in a recruiter-ready dashboard with a data chatbot.
            </p>
            <div className="actions">
              <a className="button" href="#dashboard">
                View Dashboard
              </a>
              <a className="button-secondary" href="/customers">
                All Customers
              </a>
              <a className="button-secondary" href="/about">
                About Project
              </a>
              <a className="button-secondary" href="#chatbot">
                Ask Chatbot
              </a>
            </div>
          </div>

          <div className="architecture" aria-label="Cloud architecture">
            {[
              "Public Telco CSV",
              "Airbyte Cloud File Source",
              "Neon PostgreSQL",
              "Python ML Pipeline",
              "Vercel Dashboard",
              "OpenAI Data Chatbot",
            ].map((step, index) => (
              <div className="architecture-step" key={step}>
                <span>{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="dashboard">
        <div className="container">
          {!data.configured ? (
            <div className="setup-alert">
              <strong>Setup needed:</strong>
              <p>
                Add <code>DATABASE_URL</code> to <code>.env.local</code> or Vercel after
                Airbyte loads <code>raw.customer_churn</code> and the Python pipeline
                creates the analytics tables.
              </p>
              <p>
                Start with <code>sql/01_create_schemas.sql</code>, run an Airbyte sync,
                then run <code>python scripts/transform_train.py</code>.
              </p>
            </div>
          ) : null}

          {data.error ? (
            <div className="setup-alert">
              <strong>Database connected, but dashboard queries failed.</strong>
              <p>{data.error}</p>
              <p>
                Confirm that <code>analytics.kpi_summary</code>,{" "}
                <code>analytics.churn_predictions</code>, and{" "}
                <code>analytics.churn_drivers</code> exist.
              </p>
            </div>
          ) : null}

          <h2>Executive KPIs</h2>
          {data.kpis.length ? (
            <div className="kpi-grid">
              {data.kpis.map((kpi) => (
                <article className="kpi-card" key={kpi.metric}>
                  <p className="kpi-label">{formatMetricName(kpi.metric)}</p>
                  <p className="kpi-value">{formatMetricValue(kpi.metric, kpi.value)}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              KPIs will appear here after the transformation pipeline writes{" "}
              <code>analytics.kpi_summary</code>.
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>Top High-Risk Customers</h2>
            {data.highRiskCustomers.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Churn Probability</th>
                      <th>Risk</th>
                      <th>Monthly Charges</th>
                      <th>Contract</th>
                      <th>Tenure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.highRiskCustomers.map((customer) => (
                      <tr key={customer.customerid}>
                        <td>{customer.customerid}</td>
                        <td>{percent(customer.churn_probability)}</td>
                        <td>
                          <span className="risk">{customer.risk_level}</span>
                        </td>
                        <td>{money(customer.monthlycharges)}</td>
                        <td>{customer.contract}</td>
                        <td>{customer.tenure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                High-risk customers will appear here after{" "}
                <code>analytics.churn_predictions</code> is populated.
              </div>
            )}
          </div>

          <div>
            <h2>Top Churn Drivers</h2>
            {data.drivers.length ? (
              <div className="driver-list">
                {data.drivers.map((driver) => (
                  <article className="driver-row" key={driver.feature}>
                    <div className="driver-meta">
                      <span>{driver.feature}</span>
                      <span>{Number(driver.importance).toFixed(4)}</span>
                    </div>
                    <div className="bar" aria-hidden="true">
                      <div
                        className="bar-fill"
                        style={{
                          width: driverStrength(driver, maxDriverImportance),
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                Churn drivers will appear here after model training writes{" "}
                <code>analytics.churn_drivers</code>.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section" id="chatbot">
        <div className="container">
          <h2>Airbyte Data Chatbot</h2>
          <Chatbot />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Airbyte Operations</h2>
          <AirbyteSyncButton />
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          Portfolio-grade prototype: public demo data, Airbyte ingestion, PostgreSQL
          analytics, Python ML, Vercel delivery, and OpenAI explanations.
        </div>
      </footer>
    </main>
  );
}
