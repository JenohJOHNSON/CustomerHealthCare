import AirbyteSyncButton from "./components/AirbyteSyncButton";
import Chatbot from "./components/Chatbot";
import ChurnDrivers from "./components/ChurnDrivers";
import SiteNav from "./components/SiteNav";
import {
  getPageLang,
  hrefWithLang,
  localeFor,
  type Lang,
  type LangPageProps,
} from "@/lib/i18n";
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

const text = {
  en: {
    eyebrow: "Airbyte Cloud + Neon + ML + Vercel",
    title: "Customer Health Intelligence Pipeline",
    lede:
      "A cloud data project that ingests public Telco churn data, trains a churn model, writes customer health analytics back to PostgreSQL, and presents the insights in a recruiter-ready dashboard with a data chatbot.",
    actions: {
      dashboard: "View Dashboard",
      customers: "All Customers",
      about: "About Project",
      chatbot: "Ask Chatbot",
    },
    architecture: [
      "Public Telco CSV",
      "Airbyte Cloud File Source",
      "Neon PostgreSQL",
      "Python ML Pipeline",
      "Vercel Dashboard",
      "OpenAI Data Chatbot",
    ],
    setup: {
      title: "Setup needed:",
      body:
        "Add DATABASE_URL to .env.local or Vercel after Airbyte loads raw.customer_churn and the Python pipeline creates the analytics tables.",
      next: "Start with sql/01_create_schemas.sql, run an Airbyte sync, then run python scripts/transform_train.py.",
    },
    error: {
      title: "Database connected, but dashboard queries failed.",
      body:
        "Confirm that analytics.kpi_summary, analytics.churn_predictions, and analytics.churn_drivers exist.",
    },
    kpisTitle: "Executive KPIs",
    emptyKpis:
      "KPIs will appear here after the transformation pipeline writes analytics.kpi_summary.",
    highRiskTitle: "Top High-Risk Customers",
    emptyHighRisk:
      "High-risk customers will appear here after analytics.churn_predictions is populated.",
    driversTitle: "Top Churn Drivers",
    emptyDrivers:
      "Churn drivers will appear here after model training writes analytics.churn_drivers.",
    chatbotTitle: "Airbyte Data Chatbot",
    operationsTitle: "Airbyte Operations",
    footer:
      "Portfolio-grade prototype: public demo data, Airbyte ingestion, PostgreSQL analytics, Python ML, Vercel delivery, and OpenAI explanations.",
    headers: {
      customerId: "Customer ID",
      churnProbability: "Churn Probability",
      risk: "Risk",
      monthlyCharges: "Monthly Charges",
      contract: "Contract",
      tenure: "Tenure",
    },
    risks: {
      High: "High",
      Medium: "Medium",
      Low: "Low",
    },
    metrics: {
      total_customers: "Total customers",
      actual_churn_rate_percent: "Actual churn rate",
      avg_churn_probability_percent: "Average churn probability",
      high_risk_customers: "High-risk customers",
      monthly_revenue_at_risk: "Monthly revenue at risk",
      model_accuracy: "Model accuracy",
      model_precision: "Model precision",
      model_recall: "Model recall",
      model_f1: "Model F1 score",
      model_roc_auc: "Model ROC AUC",
    },
    guideTitle: "Dashboard Column Guide",
    guideIntro:
      "This section explains what the dashboard fields mean and why each one matters.",
    kpiGuideTitle: "KPI cards",
    customerGuideTitle: "High-risk customer table",
    driverGuideTitle: "Churn driver list",
    kpiGuide: [
      ["Total customers", "Number of customers included after the data is cleaned."],
      ["Actual churn rate", "Percent of customers in the dataset who actually churned."],
      ["Average churn probability", "Average risk score predicted by the model."],
      ["High-risk customers", "Customers whose predicted churn probability is 70% or higher."],
      ["Monthly revenue at risk", "Monthly charges from high-risk customers."],
      ["Model metrics", "Accuracy, precision, recall, F1, and ROC AUC describe model quality."],
    ],
    customerGuide: [
      ["Customer ID", "Unique customer identifier from the source dataset."],
      ["Churn Probability", "Estimated chance that this customer may churn."],
      ["Risk", "Simple label based on probability: Low, Medium, or High."],
      ["Monthly Charges", "How much the customer pays each month."],
      ["Contract", "Contract type, such as month-to-month or yearly."],
      ["Tenure", "How long the customer has stayed with the company."],
    ],
    driverGuide: [
      ["Feature", "A customer attribute used by the model, such as contract type or service."],
      ["Importance", "Model coefficient. Larger absolute values have stronger influence."],
      ["Sign", "Positive values push risk higher; negative values push risk lower."],
    ],
  },
  fr: {
    eyebrow: "Airbyte Cloud + Neon + ML + Vercel",
    title: "Pipeline d'intelligence sante client",
    lede:
      "Un projet data cloud qui importe les donnees Telco, entraine un modele de churn, ecrit les analyses dans PostgreSQL et presente les resultats dans un tableau de bord avec chatbot.",
    actions: {
      dashboard: "Voir le tableau",
      customers: "Tous les clients",
      about: "A propos",
      chatbot: "Demander au chatbot",
    },
    architecture: [
      "CSV public Telco",
      "Source fichier Airbyte Cloud",
      "PostgreSQL Neon",
      "Pipeline ML Python",
      "Tableau de bord Vercel",
      "Chatbot OpenAI",
    ],
    setup: {
      title: "Configuration requise :",
      body:
        "Ajoutez DATABASE_URL dans .env.local ou Vercel apres le chargement Airbyte de raw.customer_churn et la creation des tables analytics par le pipeline Python.",
      next: "Commencez avec sql/01_create_schemas.sql, lancez une sync Airbyte, puis lancez python scripts/transform_train.py.",
    },
    error: {
      title: "Base de donnees connectee, mais les requetes du tableau ont echoue.",
      body:
        "Confirmez que analytics.kpi_summary, analytics.churn_predictions et analytics.churn_drivers existent.",
    },
    kpisTitle: "KPI executifs",
    emptyKpis:
      "Les KPI apparaitront ici apres l'ecriture de analytics.kpi_summary par le pipeline.",
    highRiskTitle: "Principaux clients a haut risque",
    emptyHighRisk:
      "Les clients a haut risque apparaitront ici apres le remplissage de analytics.churn_predictions.",
    driversTitle: "Principaux facteurs de churn",
    emptyDrivers:
      "Les facteurs de churn apparaitront ici apres l'ecriture de analytics.churn_drivers par le modele.",
    chatbotTitle: "Chatbot de donnees Airbyte",
    operationsTitle: "Operations Airbyte",
    footer:
      "Prototype portfolio : donnees publiques, ingestion Airbyte, analyses PostgreSQL, ML Python, livraison Vercel et explications OpenAI.",
    headers: {
      customerId: "ID client",
      churnProbability: "Probabilite de churn",
      risk: "Risque",
      monthlyCharges: "Charges mensuelles",
      contract: "Contrat",
      tenure: "Anciennete",
    },
    risks: {
      High: "Eleve",
      Medium: "Moyen",
      Low: "Faible",
    },
    metrics: {
      total_customers: "Clients totaux",
      actual_churn_rate_percent: "Taux de churn reel",
      avg_churn_probability_percent: "Probabilite moyenne de churn",
      high_risk_customers: "Clients a haut risque",
      monthly_revenue_at_risk: "Revenu mensuel a risque",
      model_accuracy: "Exactitude du modele",
      model_precision: "Precision du modele",
      model_recall: "Rappel du modele",
      model_f1: "Score F1 du modele",
      model_roc_auc: "ROC AUC du modele",
    },
    guideTitle: "Guide des colonnes du tableau",
    guideIntro:
      "Cette section explique la signification des champs du tableau de bord et pourquoi ils sont utiles.",
    kpiGuideTitle: "Cartes KPI",
    customerGuideTitle: "Table des clients a haut risque",
    driverGuideTitle: "Liste des facteurs de churn",
    kpiGuide: [
      ["Clients totaux", "Nombre de clients inclus apres le nettoyage des donnees."],
      ["Taux de churn reel", "Pourcentage de clients du jeu de donnees qui ont vraiment quitte."],
      ["Probabilite moyenne de churn", "Score de risque moyen predit par le modele."],
      ["Clients a haut risque", "Clients dont la probabilite de churn predite est de 70% ou plus."],
      ["Revenu mensuel a risque", "Charges mensuelles provenant des clients a haut risque."],
      ["Metriques du modele", "Accuracy, precision, recall, F1 et ROC AUC decrivent la qualite du modele."],
    ],
    customerGuide: [
      ["ID client", "Identifiant unique du client dans le jeu de donnees source."],
      ["Probabilite de churn", "Estimation de la chance que ce client quitte le service."],
      ["Risque", "Etiquette simple basee sur la probabilite : faible, moyen ou eleve."],
      ["Charges mensuelles", "Montant paye chaque mois par le client."],
      ["Contrat", "Type de contrat, par exemple mensuel ou annuel."],
      ["Anciennete", "Duree pendant laquelle le client est reste avec l'entreprise."],
    ],
    driverGuide: [
      ["Feature", "Attribut client utilise par le modele, comme le contrat ou le service."],
      ["Importance", "Coefficient du modele. Les grandes valeurs absolues influencent plus le risque."],
      ["Signe", "Une valeur positive augmente le risque; une valeur negative le reduit."],
    ],
  },
};

function formatMetricName(metric: string, lang: Lang) {
  const key = metric as keyof (typeof text)["en"]["metrics"];
  return text[lang].metrics[key] ?? metric.replaceAll("_", " ");
}

function formatMetricValue(metric: string, value: string | number, lang: Lang) {
  const numericValue = Number(value);
  const locale = localeFor(lang);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  if (metric.includes("percent")) {
    return `${numericValue.toLocaleString(locale, {
      maximumFractionDigits: 2,
    })}%`;
  }

  if (metric.includes("revenue")) {
    return numericValue.toLocaleString(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  if (metric.startsWith("model_")) {
    return numericValue.toLocaleString(locale, {
      maximumFractionDigits: 3,
      minimumFractionDigits: 3,
    });
  }

  return numericValue.toLocaleString(locale, {
    maximumFractionDigits: 2,
  });
}

function percent(value: string | number, lang: Lang) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "n/a";

  return `${Math.round(numericValue * 100).toLocaleString(localeFor(lang))}%`;
}

function money(value: string | number, lang: Lang) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "n/a";

  return numericValue.toLocaleString(localeFor(lang), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function translatedRisk(riskLevel: string, lang: Lang) {
  const key = riskLevel as keyof (typeof text)["en"]["risks"];
  return text[lang].risks[key] ?? riskLevel;
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

function GuideList({ items }: { items: string[][] }) {
  return (
    <div className="definition-list">
      {items.map(([term, description]) => (
        <p key={term}>
          <strong>{term}</strong>
          <span>{description}</span>
        </p>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: LangPageProps) {
  const lang = await getPageLang(searchParams);
  const copy = text[lang];
  const data = await getDashboardData();
  const maxDriverImportance = Math.max(
    0,
    ...data.drivers.map((driver) => Math.abs(Number(driver.importance)) || 0),
  );

  return (
    <main className="page">
      <SiteNav currentPath="/" lang={lang} />

      <section className="hero">
        <div className="container hero-inner">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="lede">{copy.lede}</p>
            <div className="actions">
              <a className="button" href={hrefWithLang("/", lang, "dashboard")}>
                {copy.actions.dashboard}
              </a>
              <a className="button-secondary" href={hrefWithLang("/customers", lang)}>
                {copy.actions.customers}
              </a>
              <a className="button-secondary" href={hrefWithLang("/about", lang)}>
                {copy.actions.about}
              </a>
              <a className="button-secondary" href={hrefWithLang("/", lang, "chatbot")}>
                {copy.actions.chatbot}
              </a>
            </div>
          </div>

          <div className="architecture" aria-label="Cloud architecture">
            {copy.architecture.map((step, index) => (
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
              <strong>{copy.setup.title}</strong>
              <p>{copy.setup.body}</p>
              <p>{copy.setup.next}</p>
            </div>
          ) : null}

          {data.error ? (
            <div className="setup-alert">
              <strong>{copy.error.title}</strong>
              <p>{data.error}</p>
              <p>{copy.error.body}</p>
            </div>
          ) : null}

          <h2>{copy.kpisTitle}</h2>
          {data.kpis.length ? (
            <div className="kpi-grid">
              {data.kpis.map((kpi) => (
                <article className="kpi-card" key={kpi.metric}>
                  <p className="kpi-label">{formatMetricName(kpi.metric, lang)}</p>
                  <p className="kpi-value">
                    {formatMetricValue(kpi.metric, kpi.value, lang)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">{copy.emptyKpis}</div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>{copy.highRiskTitle}</h2>
            {data.highRiskCustomers.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{copy.headers.customerId}</th>
                      <th>{copy.headers.churnProbability}</th>
                      <th>{copy.headers.risk}</th>
                      <th>{copy.headers.monthlyCharges}</th>
                      <th>{copy.headers.contract}</th>
                      <th>{copy.headers.tenure}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.highRiskCustomers.map((customer) => (
                      <tr key={customer.customerid}>
                        <td>{customer.customerid}</td>
                        <td>{percent(customer.churn_probability, lang)}</td>
                        <td>
                          <span className="risk">
                            {translatedRisk(customer.risk_level, lang)}
                          </span>
                        </td>
                        <td>{money(customer.monthlycharges, lang)}</td>
                        <td>{customer.contract}</td>
                        <td>{customer.tenure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">{copy.emptyHighRisk}</div>
            )}
          </div>

          <div>
            <h2>{copy.driversTitle}</h2>
            {data.drivers.length ? (
              <ChurnDrivers
                drivers={data.drivers}
                lang={lang}
                maxDriverImportance={maxDriverImportance}
              />
            ) : (
              <div className="empty">{copy.emptyDrivers}</div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>{copy.guideTitle}</h2>
              <p>{copy.guideIntro}</p>
            </div>
          </div>
          <div className="analysis-grid">
            <article>
              <h3>{copy.kpiGuideTitle}</h3>
              <GuideList items={copy.kpiGuide} />
            </article>
            <article>
              <h3>{copy.customerGuideTitle}</h3>
              <GuideList items={copy.customerGuide} />
            </article>
            <article>
              <h3>{copy.driverGuideTitle}</h3>
              <GuideList items={copy.driverGuide} />
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="chatbot">
        <div className="container">
          <h2>{copy.chatbotTitle}</h2>
          <Chatbot lang={lang} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{copy.operationsTitle}</h2>
          <AirbyteSyncButton lang={lang} />
        </div>
      </section>

      <footer className="footer">
        <div className="container">{copy.footer}</div>
      </footer>
    </main>
  );
}
