import SiteNav from "../components/SiteNav";
import { hasDatabaseUrl, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer Analysis | Customer Health Intelligence Pipeline",
  description:
    "Analyze every customer by churn probability, risk level, contract type, services, and revenue at risk.",
};

type CustomerAnalysisRow = {
  customerid: string;
  churn_probability: string | number;
  risk_level: string;
  monthlycharges: string | number;
  totalcharges: string | number | null;
  contract: string;
  tenure: string | number;
  churn: string;
  gender: string | null;
  seniorcitizen: string | number | null;
  internetservice: string | null;
  paymentmethod: string | null;
};

type SummaryRow = {
  total_customers: string | number;
  high_risk_customers: string | number;
  medium_risk_customers: string | number;
  low_risk_customers: string | number;
  avg_churn_probability: string | number;
  monthly_revenue_at_risk: string | number;
};

type SegmentRow = {
  segment: string;
  customers: string | number;
  avg_churn_probability: string | number;
  revenue_at_risk: string | number;
};

type CustomersData = {
  configured: boolean;
  error?: string;
  customers: CustomerAnalysisRow[];
  summary?: SummaryRow;
  riskSegments: SegmentRow[];
  contractSegments: SegmentRow[];
  internetSegments: SegmentRow[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown database error";
}

function numberValue(value: string | number | null | undefined) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function percent(value: string | number | null | undefined) {
  return `${Math.round(numberValue(value) * 100)}%`;
}

function money(value: string | number | null | undefined) {
  return numberValue(value).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function wholeNumber(value: string | number | null | undefined) {
  return numberValue(value).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

function riskClass(riskLevel: string) {
  return `risk ${riskLevel.toLowerCase()}`;
}

async function getCustomersData(): Promise<CustomersData> {
  if (!hasDatabaseUrl()) {
    return {
      configured: false,
      customers: [],
      riskSegments: [],
      contractSegments: [],
      internetSegments: [],
    };
  }

  try {
    const [summary, riskSegments, contractSegments, internetSegments, customers] =
      await Promise.all([
        query<SummaryRow>(`
          SELECT
            COUNT(*) AS total_customers,
            COUNT(*) FILTER (WHERE risk_level = 'High') AS high_risk_customers,
            COUNT(*) FILTER (WHERE risk_level = 'Medium') AS medium_risk_customers,
            COUNT(*) FILTER (WHERE risk_level = 'Low') AS low_risk_customers,
            AVG(churn_probability) AS avg_churn_probability,
            COALESCE(SUM(monthlycharges) FILTER (WHERE risk_level = 'High'), 0) AS monthly_revenue_at_risk
          FROM analytics.churn_predictions
        `),
        query<SegmentRow>(`
          SELECT
            risk_level AS segment,
            COUNT(*) AS customers,
            AVG(churn_probability) AS avg_churn_probability,
            COALESCE(SUM(monthlycharges) FILTER (WHERE risk_level = 'High'), 0) AS revenue_at_risk
          FROM analytics.churn_predictions
          GROUP BY risk_level
          ORDER BY
            CASE risk_level
              WHEN 'High' THEN 1
              WHEN 'Medium' THEN 2
              ELSE 3
            END
        `),
        query<SegmentRow>(`
          SELECT
            contract AS segment,
            COUNT(*) AS customers,
            AVG(churn_probability) AS avg_churn_probability,
            COALESCE(SUM(monthlycharges) FILTER (WHERE risk_level = 'High'), 0) AS revenue_at_risk
          FROM analytics.churn_predictions
          GROUP BY contract
          ORDER BY avg_churn_probability DESC
        `),
        query<SegmentRow>(`
          SELECT
            COALESCE(h.internetservice, 'Unknown') AS segment,
            COUNT(*) AS customers,
            AVG(p.churn_probability) AS avg_churn_probability,
            COALESCE(SUM(p.monthlycharges) FILTER (WHERE p.risk_level = 'High'), 0) AS revenue_at_risk
          FROM analytics.churn_predictions p
          LEFT JOIN analytics.customer_health h USING (customerid)
          GROUP BY COALESCE(h.internetservice, 'Unknown')
          ORDER BY avg_churn_probability DESC
        `),
        query<CustomerAnalysisRow>(`
          SELECT
            p.customerid,
            p.churn_probability,
            p.risk_level,
            p.monthlycharges,
            h.totalcharges,
            p.contract,
            p.tenure,
            h.churn,
            h.gender,
            h.seniorcitizen,
            h.internetservice,
            h.paymentmethod
          FROM analytics.churn_predictions p
          LEFT JOIN analytics.customer_health h USING (customerid)
          ORDER BY p.churn_probability DESC, p.monthlycharges DESC
        `),
      ]);

    return {
      configured: true,
      summary: summary.rows[0],
      riskSegments: riskSegments.rows,
      contractSegments: contractSegments.rows,
      internetSegments: internetSegments.rows,
      customers: customers.rows,
    };
  } catch (error) {
    return {
      configured: true,
      error: getErrorMessage(error),
      customers: [],
      riskSegments: [],
      contractSegments: [],
      internetSegments: [],
    };
  }
}

function SegmentTable({
  rows,
  title,
}: {
  rows: SegmentRow[];
  title: string;
}) {
  return (
    <article>
      <h2>{title}</h2>
      {rows.length ? (
        <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Customers</th>
                <th>Avg Risk</th>
                <th>Revenue At Risk</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.segment}>
                  <td>{row.segment}</td>
                  <td>{wholeNumber(row.customers)}</td>
                  <td>{percent(row.avg_churn_probability)}</td>
                  <td>{money(row.revenue_at_risk)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">This segment will appear after the pipeline runs.</div>
      )}
    </article>
  );
}

export default async function CustomersPage() {
  const data = await getCustomersData();

  return (
    <main className="page">
      <SiteNav />

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Customer analysis</p>
          <h1>All Customer Analysis</h1>
          <p className="lede">
            Review every customer, compare churn risk by segment, and identify where
            revenue is most exposed.
          </p>
          <div className="actions">
            <a className="button" href="/">
              Dashboard
            </a>
            <a className="button-secondary" href="/about">
              About Project
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!data.configured ? (
            <div className="setup-alert">
              <strong>Setup needed:</strong>
              <p>
                Add <code>DATABASE_URL</code> to Vercel, then run Airbyte and the
                GitHub Actions pipeline so the customer analytics tables exist.
              </p>
            </div>
          ) : null}

          {data.error ? (
            <div className="setup-alert">
              <strong>Customer analysis queries failed.</strong>
              <p>{data.error}</p>
              <p>
                Confirm that <code>analytics.customer_health</code> and{" "}
                <code>analytics.churn_predictions</code> exist.
              </p>
            </div>
          ) : null}

          <div className="kpi-grid">
            <article className="kpi-card">
              <p className="kpi-label">Total customers</p>
              <p className="kpi-value">{wholeNumber(data.summary?.total_customers)}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">High-risk customers</p>
              <p className="kpi-value">{wholeNumber(data.summary?.high_risk_customers)}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">Average churn risk</p>
              <p className="kpi-value">{percent(data.summary?.avg_churn_probability)}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">Monthly revenue at risk</p>
              <p className="kpi-value">{money(data.summary?.monthly_revenue_at_risk)}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container analysis-grid">
          <SegmentTable rows={data.riskSegments} title="Risk Level Breakdown" />
          <SegmentTable rows={data.contractSegments} title="Risk By Contract" />
          <SegmentTable rows={data.internetSegments} title="Risk By Internet Service" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>All Customers</h2>
              <p>
                Ordered from highest predicted churn risk to lowest. Use this table to
                spot customers who may need retention attention first.
              </p>
            </div>
            <strong>{wholeNumber(data.customers.length)} rows</strong>
          </div>

          {data.customers.length ? (
            <div className="table-wrap all-customers-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Risk</th>
                    <th>Churn Probability</th>
                    <th>Monthly Charges</th>
                    <th>Total Charges</th>
                    <th>Contract</th>
                    <th>Tenure</th>
                    <th>Actual Churn</th>
                    <th>Internet Service</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((customer) => (
                    <tr key={customer.customerid}>
                      <td>{customer.customerid}</td>
                      <td>
                        <span className={riskClass(customer.risk_level)}>
                          {customer.risk_level}
                        </span>
                      </td>
                      <td>{percent(customer.churn_probability)}</td>
                      <td>{money(customer.monthlycharges)}</td>
                      <td>{money(customer.totalcharges)}</td>
                      <td>{customer.contract}</td>
                      <td>{wholeNumber(customer.tenure)}</td>
                      <td>{customer.churn}</td>
                      <td>{customer.internetservice || "Unknown"}</td>
                      <td>{customer.paymentmethod || "Unknown"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              Customer rows will appear here after the pipeline writes{" "}
              <code>analytics.churn_predictions</code>.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
