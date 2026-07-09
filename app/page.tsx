import AirbyteSyncButton from "./components/AirbyteSyncButton";
import Chatbot from "./components/Chatbot";
import ChurnDrivers from "./components/ChurnDrivers";
import KpiCards from "./components/KpiCards";
import SiteFooter from "./components/SiteFooter";
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

type ModelEvaluationRow = {
  metric: string;
  value: string | number;
};

type DashboardData = {
  configured: boolean;
  error?: string;
  kpis: KpiRow[];
  highRiskCustomers: CustomerRow[];
  drivers: DriverRow[];
  modelEvaluation: ModelEvaluationRow[];
};

const text = {
  en: {
    eyebrow: "Airbyte + Neon + Python + Vercel",
    architectureLabel: "Cloud project steps",
    title: "Customer Leaving Risk Dashboard",
    lede:
      "A simple cloud dashboard that shows which customers may leave, why they may leave, and how much monthly revenue is at risk.",
    actions: {
      dashboard: "View Main Numbers",
      customers: "All Customers",
      about: "How It Works",
      chatbot: "Ask the Chatbot",
    },
    architecture: [
      "Public customer file",
      "Airbyte loads the data",
      "Neon stores the data",
      "Python predicts leaving risk",
      "Vercel shows the dashboard",
      "Chatbot answers questions",
    ],
    setup: {
      title: "Setup still needed:",
      body:
        "The app needs a database connection before it can show live numbers.",
      next: "Add DATABASE_URL, load the customer file with Airbyte, then run the Python data job.",
    },
    error: {
      title: "The database connected, but the dashboard tables are not ready.",
      body:
        "Run the Python data job again, then refresh this page.",
    },
    kpisTitle: "Main Numbers",
    emptyKpis:
      "The main numbers will appear here after the data pipeline runs.",
    highRiskTitle: "Customers Most Likely to Leave",
    emptyHighRisk:
      "Customers most likely to leave will appear here after the prediction table is ready.",
    driversTitle: "Big Reasons Customers May Leave",
    emptyDrivers:
      "Reasons customers may leave will appear here after the model is trained.",
    chatbotTitle: "Ask the Data Chatbot",
    operationsTitle: "Refresh Source Data",
    headers: {
      customerId: "Customer",
      churnProbability: "Chance of Leaving",
      risk: "Risk Level",
      monthlyCharges: "Monthly Bill",
      contract: "Contract Type",
      tenure: "Months as Customer",
    },
    risks: {
      High: "High",
      Medium: "Medium",
      Low: "Low",
    },
    metrics: {
      total_customers: "Customers",
      actual_churn_rate_percent: "Customers who really left",
      avg_churn_probability_percent: "Average chance of leaving",
      high_risk_customers: "Likely to leave",
      monthly_revenue_at_risk: "Monthly bill at risk",
      model_accuracy: "Model correct rate",
      model_precision: "Warning accuracy",
      model_recall: "Leaver catch rate",
      model_f1: "Model balance score",
      model_roc_auc: "Risk ranking score",
    },
    guideTitle: "What These Dashboard Fields Mean",
    guideIntro:
      "This section explains the table and card names in plain language.",
    kpiGuideTitle: "Main number cards",
    customerGuideTitle: "Customers likely to leave table",
    driverGuideTitle: "Reasons customers may leave chart",
    kpiGuide: [
      ["Customers", "How many customer records are in the clean data."],
      ["Customers who really left", "The percent of customers who actually stopped service in the data."],
      ["Average chance of leaving", "The model's average predicted chance that customers may leave."],
      ["Likely to leave", "Customers whose predicted chance of leaving is 70% or higher."],
      ["Monthly bill at risk", "Monthly money connected to customers who are likely to leave."],
      ["Model scores", "Simple checks that show how well the prediction model worked."],
    ],
    customerGuide: [
      ["Customer", "The customer's unique ID."],
      ["Chance of Leaving", "The model's estimated chance that this customer may leave."],
      ["Risk Level", "A simple label: Low, Medium, or High."],
      ["Monthly Bill", "How much the customer pays each month."],
      ["Contract Type", "The customer's plan, such as monthly or yearly."],
      ["Months as Customer", "How long the customer has stayed with the company."],
    ],
    driverGuide: [
      ["Reason", "A customer detail used by the model, such as contract type or service."],
      ["Strength", "Longer bars mean the reason matters more to the model."],
      ["Direction", "Red raises the chance of leaving. Green lowers it."],
    ],
  },
  fr: {
    eyebrow: "Airbyte + Neon + Python + Vercel",
    architectureLabel: "Étapes du projet cloud",
    title: "Tableau du risque de départ client",
    lede:
      "Un tableau cloud simple qui montre quels clients risquent de partir, pourquoi ils peuvent partir et quel revenu mensuel est à risque.",
    actions: {
      dashboard: "Voir les chiffres clés",
      customers: "Tous les clients",
      about: "Comment ça marche",
      chatbot: "Demander au chatbot",
    },
    architecture: [
      "Fichier client public",
      "Airbyte charge les données",
      "Neon stocke les données",
      "Python prédit le risque de départ",
      "Vercel affiche le tableau",
      "Le chatbot répond aux questions",
    ],
    setup: {
      title: "Configuration encore nécessaire :",
      body:
        "L'application a besoin d'une connexion à la base de données avant d'afficher les vrais chiffres.",
      next: "Ajoutez DATABASE_URL, chargez le fichier client avec Airbyte, puis lancez le travail Python.",
    },
    error: {
      title: "La base est connectée, mais les tables du tableau ne sont pas prêtes.",
      body:
        "Relancez le travail Python, puis actualisez cette page.",
    },
    kpisTitle: "Chiffres clés",
    emptyKpis:
      "Les chiffres clés apparaîtront ici après l'exécution du pipeline.",
    highRiskTitle: "Clients les plus susceptibles de partir",
    emptyHighRisk:
      "Les clients les plus susceptibles de partir apparaîtront ici après la création des prédictions.",
    driversTitle: "Grandes raisons possibles de départ",
    emptyDrivers:
      "Les raisons possibles de départ apparaîtront ici après l'entraînement du modèle.",
    chatbotTitle: "Demander au chatbot data",
    operationsTitle: "Actualiser les données source",
    headers: {
      customerId: "Client",
      churnProbability: "Chance de partir",
      risk: "Niveau de risque",
      monthlyCharges: "Facture mensuelle",
      contract: "Type de contrat",
      tenure: "Mois comme client",
    },
    risks: {
      High: "Élevé",
      Medium: "Moyen",
      Low: "Faible",
    },
    metrics: {
      total_customers: "Clients",
      actual_churn_rate_percent: "Clients vraiment partis",
      avg_churn_probability_percent: "Chance moyenne de partir",
      high_risk_customers: "Susceptibles de partir",
      monthly_revenue_at_risk: "Facture mensuelle à risque",
      model_accuracy: "Taux de bonnes réponses",
      model_precision: "Qualité des alertes",
      model_recall: "Départs retrouvés",
      model_f1: "Score d'équilibre",
      model_roc_auc: "Score de classement du risque",
    },
    guideTitle: "Ce que signifient les champs du tableau",
    guideIntro:
      "Cette section explique les noms des cartes et des colonnes avec des mots simples.",
    kpiGuideTitle: "Cartes de chiffres clés",
    customerGuideTitle: "Table des clients qui risquent de partir",
    driverGuideTitle: "Graphique des raisons possibles de départ",
    kpiGuide: [
      ["Clients", "Nombre de lignes client dans les données nettoyées."],
      ["Clients qui sont vraiment partis", "Pourcentage de clients qui ont vraiment arrêté le service."],
      ["Chance moyenne de partir", "Chance moyenne de départ prédite par le modèle."],
      ["Susceptibles de partir", "Clients avec une chance prédite de départ de 70% ou plus."],
      ["Facture mensuelle à risque", "Argent mensuel lié aux clients susceptibles de partir."],
      ["Scores du modèle", "Contrôles simples qui montrent si le modèle prédit correctement."],
    ],
    customerGuide: [
      ["Client", "Identifiant unique du client."],
      ["Chance de partir", "Chance estimée que ce client arrête le service."],
      ["Niveau de risque", "Étiquette simple : faible, moyen ou élevé."],
      ["Facture mensuelle", "Montant payé chaque mois par le client."],
      ["Type de contrat", "Plan du client, par exemple mensuel ou annuel."],
      ["Mois comme client", "Durée pendant laquelle le client est resté avec l'entreprise."],
    ],
    driverGuide: [
      ["Raison", "Détail client utilisé par le modèle, comme le contrat ou le service."],
      ["Force", "Plus la barre est longue, plus cette raison compte pour le modèle."],
      ["Direction", "Rouge augmente la chance de partir. Vert la réduit."],
    ],
  },
};

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
      modelEvaluation: [],
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
    let modelEvaluation: ModelEvaluationRow[] = [];

    try {
      const evaluation = await query<ModelEvaluationRow>(`
        SELECT metric, value
        FROM analytics.model_evaluation
        ORDER BY metric
      `);
      modelEvaluation = evaluation.rows;
    } catch {
      modelEvaluation = [];
    }

    return {
      configured: true,
      kpis: kpis.rows,
      highRiskCustomers: highRiskCustomers.rows,
      drivers: drivers.rows,
      modelEvaluation,
    };
  } catch (error) {
    return {
      configured: true,
      error: getErrorMessage(error),
      kpis: [],
      highRiskCustomers: [],
      drivers: [],
      modelEvaluation: [],
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

          <div className="architecture" aria-label={copy.architectureLabel}>
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
            <KpiCards
              kpis={data.kpis}
              lang={lang}
              modelEvaluation={data.modelEvaluation}
            />
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

      <SiteFooter lang={lang} />
    </main>
  );
}
