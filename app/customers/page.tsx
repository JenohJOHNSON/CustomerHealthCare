import SiteNav from "../components/SiteNav";
import {
  getPageLang,
  hrefWithLang,
  localeFor,
  type Lang,
  type LangPageProps,
} from "@/lib/i18n";
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

const text = {
  en: {
    eyebrow: "Customer analysis",
    title: "All Customer Analysis",
    lede:
      "Review every customer, compare churn risk by segment, and identify where revenue is most exposed.",
    actions: {
      dashboard: "Dashboard",
      about: "About Project",
    },
    setup: {
      title: "Setup needed:",
      body:
        "Add DATABASE_URL to Vercel, then run Airbyte and the GitHub Actions pipeline so the customer analytics tables exist.",
    },
    error: {
      title: "Customer analysis queries failed.",
      body:
        "Confirm that analytics.customer_health and analytics.churn_predictions exist.",
    },
    cards: {
      total: "Total customers",
      highRisk: "High-risk customers",
      avgRisk: "Average churn risk",
      revenue: "Monthly revenue at risk",
    },
    segmentHeaders: {
      segment: "Segment",
      customers: "Customers",
      avgRisk: "Avg Risk",
      revenue: "Revenue At Risk",
    },
    segments: {
      risk: "Risk Level Breakdown",
      contract: "Risk By Contract",
      internet: "Risk By Internet Service",
      empty: "This segment will appear after the pipeline runs.",
    },
    customersTitle: "All Customers",
    customersDescription:
      "Ordered from highest predicted churn risk to lowest. Use this table to spot customers who may need retention attention first.",
    rows: "rows",
    emptyCustomers:
      "Customer rows will appear here after the pipeline writes analytics.churn_predictions.",
    table: {
      customerId: "Customer ID",
      risk: "Risk",
      probability: "Churn Probability",
      monthly: "Monthly Charges",
      total: "Total Charges",
      contract: "Contract",
      tenure: "Tenure",
      actualChurn: "Actual Churn",
      internet: "Internet Service",
      payment: "Payment Method",
    },
    risks: {
      High: "High",
      Medium: "Medium",
      Low: "Low",
    },
    unknown: "Unknown",
  },
  fr: {
    eyebrow: "Analyse client",
    title: "Analyse de tous les clients",
    lede:
      "Consultez chaque client, comparez le risque de churn par segment et identifiez où le revenu est le plus exposé.",
    actions: {
      dashboard: "Tableau de bord",
      about: "À propos",
    },
    setup: {
      title: "Configuration requise :",
      body:
        "Ajoutez DATABASE_URL dans Vercel, puis lancez Airbyte et le pipeline GitHub Actions afin que les tables analytics client existent.",
    },
    error: {
      title: "Les requêtes d'analyse client ont échoué.",
      body:
        "Confirmez que analytics.customer_health et analytics.churn_predictions existent.",
    },
    cards: {
      total: "Clients totaux",
      highRisk: "Clients à haut risque",
      avgRisk: "Risque moyen de churn",
      revenue: "Revenu mensuel à risque",
    },
    segmentHeaders: {
      segment: "Segment",
      customers: "Clients",
      avgRisk: "Risque moyen",
      revenue: "Revenu à risque",
    },
    segments: {
      risk: "Répartition par niveau de risque",
      contract: "Risque par contrat",
      internet: "Risque par service internet",
      empty: "Ce segment apparaîtra après l'exécution du pipeline.",
    },
    customersTitle: "Tous les clients",
    customersDescription:
      "Classés du risque de churn prédit le plus élevé au plus faible. Utilisez cette table pour repérer les clients à traiter en priorité.",
    rows: "lignes",
    emptyCustomers:
      "Les lignes client apparaîtront ici après l'écriture de analytics.churn_predictions par le pipeline.",
    table: {
      customerId: "ID client",
      risk: "Risque",
      probability: "Probabilité de churn",
      monthly: "Charges mensuelles",
      total: "Charges totales",
      contract: "Contrat",
      tenure: "Ancienneté",
      actualChurn: "Churn réel",
      internet: "Service internet",
      payment: "Méthode de paiement",
    },
    risks: {
      High: "Élevé",
      Medium: "Moyen",
      Low: "Faible",
    },
    unknown: "Inconnu",
  },
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown database error";
}

function numberValue(value: string | number | null | undefined) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function percent(value: string | number | null | undefined, lang: Lang) {
  return `${Math.round(numberValue(value) * 100).toLocaleString(localeFor(lang))}%`;
}

function money(value: string | number | null | undefined, lang: Lang) {
  return numberValue(value).toLocaleString(localeFor(lang), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function wholeNumber(value: string | number | null | undefined, lang: Lang) {
  return numberValue(value).toLocaleString(localeFor(lang), {
    maximumFractionDigits: 0,
  });
}

function riskClass(riskLevel: string) {
  return `risk ${riskLevel.toLowerCase()}`;
}

function translatedRisk(riskLevel: string, lang: Lang) {
  const key = riskLevel as keyof (typeof text)["en"]["risks"];
  return text[lang].risks[key] ?? riskLevel;
}

function displaySegment(segment: string, lang: Lang) {
  return translatedRisk(segment, lang);
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
  lang,
  rows,
  title,
}: {
  lang: Lang;
  rows: SegmentRow[];
  title: string;
}) {
  const copy = text[lang];

  return (
    <article>
      <h2>{title}</h2>
      {rows.length ? (
        <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>{copy.segmentHeaders.segment}</th>
                <th>{copy.segmentHeaders.customers}</th>
                <th>{copy.segmentHeaders.avgRisk}</th>
                <th>{copy.segmentHeaders.revenue}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.segment}>
                  <td>{displaySegment(row.segment, lang)}</td>
                  <td>{wholeNumber(row.customers, lang)}</td>
                  <td>{percent(row.avg_churn_probability, lang)}</td>
                  <td>{money(row.revenue_at_risk, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">{copy.segments.empty}</div>
      )}
    </article>
  );
}

export default async function CustomersPage({ searchParams }: LangPageProps) {
  const lang = await getPageLang(searchParams);
  const copy = text[lang];
  const data = await getCustomersData();

  return (
    <main className="page">
      <SiteNav currentPath="/customers" lang={lang} />

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="lede">{copy.lede}</p>
          <div className="actions">
            <a className="button" href={hrefWithLang("/", lang)}>
              {copy.actions.dashboard}
            </a>
            <a className="button-secondary" href={hrefWithLang("/about", lang)}>
              {copy.actions.about}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!data.configured ? (
            <div className="setup-alert">
              <strong>{copy.setup.title}</strong>
              <p>{copy.setup.body}</p>
            </div>
          ) : null}

          {data.error ? (
            <div className="setup-alert">
              <strong>{copy.error.title}</strong>
              <p>{data.error}</p>
              <p>{copy.error.body}</p>
            </div>
          ) : null}

          <div className="kpi-grid">
            <article className="kpi-card">
              <p className="kpi-label">{copy.cards.total}</p>
              <p className="kpi-value">
                {wholeNumber(data.summary?.total_customers, lang)}
              </p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">{copy.cards.highRisk}</p>
              <p className="kpi-value">
                {wholeNumber(data.summary?.high_risk_customers, lang)}
              </p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">{copy.cards.avgRisk}</p>
              <p className="kpi-value">
                {percent(data.summary?.avg_churn_probability, lang)}
              </p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">{copy.cards.revenue}</p>
              <p className="kpi-value">
                {money(data.summary?.monthly_revenue_at_risk, lang)}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container analysis-grid">
          <SegmentTable lang={lang} rows={data.riskSegments} title={copy.segments.risk} />
          <SegmentTable
            lang={lang}
            rows={data.contractSegments}
            title={copy.segments.contract}
          />
          <SegmentTable
            lang={lang}
            rows={data.internetSegments}
            title={copy.segments.internet}
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>{copy.customersTitle}</h2>
              <p>{copy.customersDescription}</p>
            </div>
            <strong>
              {wholeNumber(data.customers.length, lang)} {copy.rows}
            </strong>
          </div>

          {data.customers.length ? (
            <div className="table-wrap all-customers-table">
              <table>
                <thead>
                  <tr>
                    <th>{copy.table.customerId}</th>
                    <th>{copy.table.risk}</th>
                    <th>{copy.table.probability}</th>
                    <th>{copy.table.monthly}</th>
                    <th>{copy.table.total}</th>
                    <th>{copy.table.contract}</th>
                    <th>{copy.table.tenure}</th>
                    <th>{copy.table.actualChurn}</th>
                    <th>{copy.table.internet}</th>
                    <th>{copy.table.payment}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((customer) => (
                    <tr key={customer.customerid}>
                      <td>{customer.customerid}</td>
                      <td>
                        <span className={riskClass(customer.risk_level)}>
                          {translatedRisk(customer.risk_level, lang)}
                        </span>
                      </td>
                      <td>{percent(customer.churn_probability, lang)}</td>
                      <td>{money(customer.monthlycharges, lang)}</td>
                      <td>{money(customer.totalcharges, lang)}</td>
                      <td>{customer.contract}</td>
                      <td>{wholeNumber(customer.tenure, lang)}</td>
                      <td>{customer.churn}</td>
                      <td>{customer.internetservice || copy.unknown}</td>
                      <td>{customer.paymentmethod || copy.unknown}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">{copy.emptyCustomers}</div>
          )}
        </div>
      </section>
    </main>
  );
}
