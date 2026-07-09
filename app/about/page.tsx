import SiteFooter from "../components/SiteFooter";
import SiteNav from "../components/SiteNav";
import {
  getPageLang,
  hrefWithLang,
  type LangPageProps,
} from "@/lib/i18n";

export const metadata = {
  title: "About | Customer Health Intelligence Pipeline",
  description:
    "Learn how the Customer Health Intelligence Pipeline works, including the data workflow, technology stack, and project purpose.",
};

const githubUrl = "https://github.com/JenohJOHNSON/CustomerHealthCare";
const dataSourceUrl =
  "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv";

const text = {
  en: {
    eyebrow: "Project overview",
    title: "About This Customer Health Dashboard",
    lede:
      "This site is a cloud data project that helps answer a practical business question: which customers are most likely to leave, and what patterns are connected to that risk?",
    actions: {
      customers: "Explore Customers",
      dashboard: "Back to Dashboard",
      github: "GitHub Project",
      data: "Data Source",
    },
    whatTitle: "What The Site Does",
    whatBody: [
      "The dashboard shows customer churn insights. Churn means a customer stops using a service. The project estimates churn risk, highlights high-risk customers, shows revenue at risk, and lists the strongest churn drivers.",
      "It is designed as a portfolio project: small enough to understand, but complete enough to show a real data workflow from ingestion to business explanation.",
    ],
    readTitle: "How To Read The Results",
    readBody: [
      "A high churn probability means the model found patterns that look similar to customers who previously churned. It is a warning signal, not a guarantee.",
      "The churn drivers show which features influenced the model most. They help explain the model, but they do not prove that one factor directly caused churn.",
    ],
    riskTitle: "How Customer Risk Is Calculated",
    riskBody: [
      "The Python pipeline cleans each customer row and converts useful fields into model-ready features. Numeric fields such as tenure, monthly charges, and total charges are scaled. Text fields such as contract type, internet service, and payment method are converted into machine-readable columns with one-hot encoding.",
      "The model returns a churn probability between 0 and 1 for each customer. The app then turns that probability into a simple label: Low risk is below 40%, Medium risk is 40% to 70%, and High risk is 70% or higher.",
    ],
    mlTitle: "Machine Learning Function Used",
    mlBody: [
      "The project uses scikit-learn LogisticRegression inside a Pipeline. Logistic regression is a machine learning function for binary classification, which means it predicts one of two outcomes. Here the outcome is churn: Yes or No.",
      "It is used because it is simple, fast, interpretable, and gives probabilities. That makes it a strong first model for a business dashboard because we can explain which features push churn risk up or down.",
    ],
    airbyteTitle: "How Airbyte Is Used",
    airbyteBody: [
      "Airbyte Cloud is the ingestion tool. It connects to the public CSV file through an HTTPS File source, then writes the data into Neon PostgreSQL as raw.customer_churn.",
      "Airbyte does not train the model. Its job is to move data reliably into the database. After Airbyte loads the raw table, GitHub Actions runs the Python pipeline that cleans, trains, and writes analytics tables.",
    ],
    workflowTitle: "Workflow",
    technologyTitle: "Technology Used",
    databaseTitle: "Database Tables",
    workflowSteps: [
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
    ],
    technologies: [
      ["Airbyte Cloud", "Moves the public CSV data into PostgreSQL."],
      ["Neon PostgreSQL", "Stores raw data, cleaned data, predictions, KPIs, and pipeline history."],
      ["GitHub Actions", "Runs the Python transformation and model training workflow in the cloud."],
      ["Python", "Cleans the data and trains the churn prediction model."],
      ["pandas", "Loads, cleans, and reshapes customer records."],
      ["scikit-learn", "Builds the machine learning model."],
      ["Next.js", "Powers the dashboard pages and API routes."],
      ["Vercel", "Hosts the live web app."],
      ["OpenAI API", "Turns the analytics context into plain-English chatbot answers."],
    ],
    tables: [
      ["raw.customer_churn", "Original records loaded by Airbyte."],
      ["analytics.customer_health", "Cleaned customer records used for analysis."],
      ["analytics.churn_predictions", "One row per customer with churn probability and risk level."],
      ["analytics.kpi_summary", "Dashboard cards such as churn rate and revenue at risk."],
      ["analytics.model_evaluation", "Test-set counts behind model KPI scores."],
      ["analytics.churn_drivers", "Features that most influenced the churn model."],
    ],
  },
  fr: {
    eyebrow: "Vue du projet",
    title: "À propos de ce tableau de santé client",
    lede:
      "Ce site est un projet data cloud qui répond à une question business simple : quels clients risquent de partir et quels patterns sont liés à ce risque ?",
    actions: {
      customers: "Explorer les clients",
      dashboard: "Retour au tableau",
      github: "Projet GitHub",
      data: "Source des données",
    },
    whatTitle: "Fonction du site",
    whatBody: [
      "Le tableau montre des insights de churn client. Le churn signifie qu'un client quitte un service. Le projet estime le risque de churn, met en avant les clients à haut risque, montre le revenu à risque et liste les principaux facteurs de churn.",
      "C'est un projet portfolio : assez simple pour être compris, mais assez complet pour montrer un vrai workflow data de l'ingestion jusqu'à l'explication business.",
    ],
    readTitle: "Comment lire les résultats",
    readBody: [
      "Une forte probabilité de churn signifie que le modèle a trouvé des patterns proches de clients qui ont déjà quitté. C'est un signal d'alerte, pas une certitude.",
      "Les facteurs de churn indiquent quelles variables ont le plus influencé le modèle. Ils aident à expliquer le modèle, mais ne prouvent pas qu'un facteur cause directement le churn.",
    ],
    riskTitle: "Comment le risque client est calculé",
    riskBody: [
      "Le pipeline Python nettoie chaque ligne client et transforme les champs utiles en variables utilisables par le modèle. Les champs numériques comme l'ancienneté, les charges mensuelles et les charges totales sont mis à l'échelle. Les champs texte comme le type de contrat, le service internet et la méthode de paiement sont convertis en colonnes numériques avec one-hot encoding.",
      "Le modèle retourne une probabilité de churn entre 0 et 1 pour chaque client. L'application transforme ensuite cette probabilité en étiquette simple : risque faible sous 40%, risque moyen entre 40% et 70%, et risque élevé à partir de 70%.",
    ],
    mlTitle: "Fonction de machine learning utilisée",
    mlBody: [
      "Le projet utilise LogisticRegression de scikit-learn dans un Pipeline. La régression logistique est une fonction de machine learning pour la classification binaire, c'est-à-dire qu'elle prédit un résultat parmi deux choix. Ici, le résultat est churn : Oui ou Non.",
      "Elle est utilisée parce qu'elle est simple, rapide, interprétable et produit des probabilités. C'est donc un bon premier modèle pour un tableau business, car on peut expliquer quelles variables augmentent ou réduisent le risque.",
    ],
    airbyteTitle: "Comment Airbyte est utilisé",
    airbyteBody: [
      "Airbyte Cloud est l'outil d'ingestion. Il se connecte au fichier CSV public avec une source File HTTPS, puis écrit les données dans Neon PostgreSQL sous raw.customer_churn.",
      "Airbyte n'entraîne pas le modèle. Son rôle est de déplacer les données de façon fiable vers la base. Après le chargement de la table raw par Airbyte, GitHub Actions lance le pipeline Python qui nettoie, entraîne et écrit les tables analytics.",
    ],
    workflowTitle: "Workflow",
    technologyTitle: "Technologies utilisées",
    databaseTitle: "Tables de base de données",
    workflowSteps: [
      {
        title: "Collecter les données",
        body: "Airbyte Cloud lit le CSV public Telco Customer Churn et le charge dans Neon PostgreSQL.",
      },
      {
        title: "Stocker les données brutes",
        body: "La base conserve les lignes originales dans le schéma raw afin que le pipeline ait un point de départ propre.",
      },
      {
        title: "Nettoyer et préparer",
        body: "Un script Python normalise les noms de colonnes, convertit charges et ancienneté en nombres, remplit les valeurs manquantes et crée des variables utiles.",
      },
      {
        title: "Entraîner le modèle",
        body: "Scikit-learn entraîne une régression logistique qui estime la probabilité de churn de chaque client.",
      },
      {
        title: "Publier les analyses",
        body: "Le pipeline écrit les tables prêtes pour le tableau dans le schéma analytics : KPI, prédictions et facteurs de churn.",
      },
      {
        title: "Expliquer les résultats",
        body: "Le tableau Vercel montre les métriques business, et le chatbot OpenAI répond avec les tables analytics.",
      },
    ],
    technologies: [
      ["Airbyte Cloud", "Déplace les données du CSV public vers PostgreSQL."],
      ["Neon PostgreSQL", "Stocke les données brutes, nettoyées, les prédictions, les KPI et l'historique."],
      ["GitHub Actions", "Lance le workflow Python de transformation et d'entraînement dans le cloud."],
      ["Python", "Nettoie les données et entraîne le modèle de prédiction du churn."],
      ["pandas", "Charge, nettoie et reformate les lignes clients."],
      ["scikit-learn", "Construit le modèle de machine learning."],
      ["Next.js", "Alimente les pages du tableau et les routes API."],
      ["Vercel", "Héberge l'application web."],
      ["OpenAI API", "Transforme le contexte analytique en réponses simples."],
    ],
    tables: [
      ["raw.customer_churn", "Lignes originales chargées par Airbyte."],
      ["analytics.customer_health", "Lignes clients nettoyées pour l'analyse."],
      ["analytics.churn_predictions", "Une ligne par client avec probabilité de churn et niveau de risque."],
      ["analytics.kpi_summary", "Cartes du tableau comme le taux de churn et le revenu à risque."],
      ["analytics.model_evaluation", "Nombres du jeu de test derrière les KPI du modèle."],
      ["analytics.churn_drivers", "Variables qui ont le plus influencé le modèle."],
    ],
  },
};

function InfoPanel({ body, title }: { body: string[]; title: string }) {
  return (
    <article className="info-panel">
      <h2>{title}</h2>
      {body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </article>
  );
}

export default async function AboutPage({ searchParams }: LangPageProps) {
  const lang = await getPageLang(searchParams);
  const copy = text[lang];

  return (
    <main className="page">
      <SiteNav currentPath="/about" lang={lang} />

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="lede">{copy.lede}</p>
          <div className="actions">
            <a className="button" href={hrefWithLang("/customers", lang)}>
              {copy.actions.customers}
            </a>
            <a className="button-secondary" href={hrefWithLang("/", lang)}>
              {copy.actions.dashboard}
            </a>
            <a className="button-secondary" href={githubUrl}>
              {copy.actions.github}
            </a>
            <a className="button-secondary" href={dataSourceUrl}>
              {copy.actions.data}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container content-grid">
          <InfoPanel body={copy.whatBody} title={copy.whatTitle} />
          <InfoPanel body={copy.readBody} title={copy.readTitle} />
          <InfoPanel body={copy.riskBody} title={copy.riskTitle} />
          <InfoPanel body={copy.mlBody} title={copy.mlTitle} />
          <InfoPanel body={copy.airbyteBody} title={copy.airbyteTitle} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{copy.workflowTitle}</h2>
          <div className="workflow-grid">
            {copy.workflowSteps.map((step, index) => (
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
            <h2>{copy.technologyTitle}</h2>
            <div className="tech-list">
              {copy.technologies.map(([name, description]) => (
                <article className="tech-item" key={name}>
                  <strong>{name}</strong>
                  <span>{description}</span>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2>{copy.databaseTitle}</h2>
            <div className="definition-list">
              {copy.tables.map(([name, description]) => (
                <p key={name}>
                  <strong>{name}</strong>
                  <span>{description}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}
