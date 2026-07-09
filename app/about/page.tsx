import SiteFooter from "../components/SiteFooter";
import SiteNav from "../components/SiteNav";
import {
  getPageLang,
  hrefWithLang,
  type LangPageProps,
} from "@/lib/i18n";

export const metadata = {
  title: "How It Works | Customer Leaving Risk Dashboard",
  description:
    "Learn how the dashboard predicts which customers may leave and explains the main reasons in simple language.",
};

const githubUrl = "https://github.com/JenohJOHNSON/CustomerHealthCare";
const dataSourceUrl =
  "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv";

const text = {
  en: {
    eyebrow: "How it works",
    title: "How This Dashboard Works",
    lede:
      "This site answers one simple question: which customers may leave soon, and what clues make the model think that?",
    actions: {
      customers: "See Customers",
      dashboard: "Back to Dashboard",
      github: "GitHub Project",
      data: "Data Source",
    },
    whatTitle: "What The Site Shows",
    whatBody: [
      "The dashboard shows which customers may stop using a service. In data projects, this is often called churn. Here, the UI mostly says leaving because that is easier to understand.",
      "It highlights customers most likely to leave, the monthly money connected to those customers, and the biggest reasons the model sees.",
    ],
    readTitle: "How To Read The Numbers",
    readBody: [
      "A high chance of leaving means the model found a customer who looks similar to customers who left in the past. It is a warning sign, not a promise.",
      "The reasons chart shows which customer details mattered most to the model. It helps explain the prediction, but it does not prove one detail caused the customer to leave.",
    ],
    riskTitle: "How The Risk Score Is Made",
    riskBody: [
      "Python cleans each customer row. It turns numbers like monthly bill and months as customer into model-ready values. It also turns words like contract type and payment type into simple 0/1 columns.",
      "The model gives each customer a chance of leaving from 0% to 100%. The app then labels that score as Low, Medium, or High risk.",
    ],
    mlTitle: "Machine Learning Used",
    mlBody: [
      "The project uses logistic regression from scikit-learn. That means the model predicts one of two answers: the customer leaves or the customer stays.",
      "It is used because it is quick, easier to explain than many models, and gives a percentage chance of leaving. That makes it a good first model for a clear business dashboard.",
    ],
    airbyteTitle: "How Airbyte Is Used",
    airbyteBody: [
      "Airbyte Cloud moves the public customer file into the Neon database.",
      "Airbyte does not train the model. Its job is to load the data. After that, Python cleans the data, trains the model, and saves dashboard-ready tables.",
    ],
    workflowTitle: "Step-by-Step Flow",
    technologyTitle: "Tools Used",
    databaseTitle: "Database Tables Used",
    workflowSteps: [
      {
        title: "Collect the data",
        body: "Airbyte reads the public customer file and loads it into Neon PostgreSQL.",
      },
      {
        title: "Store raw records",
        body: "The database keeps the original customer rows so Python has a clean starting point.",
      },
      {
        title: "Clean and prepare",
        body: "Python cleans column names, fixes missing values, and prepares useful customer details.",
      },
      {
        title: "Train the model",
        body: "Python trains a model that estimates each customer's chance of leaving.",
      },
      {
        title: "Save dashboard tables",
        body: "The pipeline saves tables for main numbers, customer predictions, and leaving reasons.",
      },
      {
        title: "Explain the results",
        body: "The dashboard shows the results, and the chatbot answers questions using those tables.",
      },
    ],
    technologies: [
      ["Airbyte Cloud", "Moves the public customer file into the database."],
      ["Neon PostgreSQL", "Stores the raw data, clean data, predictions, and dashboard numbers."],
      ["GitHub Actions", "Runs the Python data job in the cloud."],
      ["Python", "Cleans the data and trains the leaving-risk model."],
      ["pandas", "Helps Python clean and reshape customer rows."],
      ["scikit-learn", "Builds the prediction model."],
      ["Next.js", "Builds the dashboard pages and API routes."],
      ["Vercel", "Hosts the live web app."],
      ["OpenAI API", "Helps the chatbot answer questions in plain language."],
    ],
    tables: [
      ["raw.customer_churn", "Original customer rows loaded by Airbyte."],
      ["analytics.customer_health", "Clean customer rows used by the dashboard."],
      ["analytics.churn_predictions", "One row per customer with chance of leaving and risk level."],
      ["analytics.kpi_summary", "Main dashboard numbers."],
      ["analytics.model_evaluation", "Counts that explain the model score cards."],
      ["analytics.churn_drivers", "Customer details that most affected the model."],
    ],
  },
  fr: {
    eyebrow: "Comment ça marche",
    title: "Comment fonctionne ce tableau",
    lede:
      "Ce site répond à une question simple : quels clients risquent de partir bientôt, et quels indices font penser cela au modèle ?",
    actions: {
      customers: "Explorer les clients",
      dashboard: "Retour au tableau",
      github: "Projet GitHub",
      data: "Source des données",
    },
    whatTitle: "Ce que montre le site",
    whatBody: [
      "Le tableau montre quels clients peuvent arrêter un service. Dans les projets data, on appelle souvent cela le churn. Ici, l'interface parle surtout de départ, car c'est plus simple.",
      "Il met en avant les clients les plus susceptibles de partir, l'argent mensuel lié à ces clients et les grandes raisons vues par le modèle.",
    ],
    readTitle: "Comment lire les chiffres",
    readBody: [
      "Une forte chance de partir signifie que le client ressemble à des clients qui sont partis dans le passé. C'est un signal d'alerte, pas une certitude.",
      "Le graphique des raisons montre quels détails client ont le plus compté pour le modèle. Cela explique la prédiction, mais ne prouve pas une cause directe.",
    ],
    riskTitle: "Comment le score de risque est créé",
    riskBody: [
      "Python nettoie chaque ligne client. Il prépare les nombres comme la facture mensuelle et les mois comme client. Il transforme aussi les mots comme le type de contrat en colonnes 0/1.",
      "Le modèle donne à chaque client une chance de partir de 0% à 100%. L'application transforme ensuite ce score en risque faible, moyen ou élevé.",
    ],
    mlTitle: "Machine learning utilisé",
    mlBody: [
      "Le projet utilise la régression logistique de scikit-learn. Le modèle prédit une réponse parmi deux choix : le client part ou le client reste.",
      "Elle est utilisée parce qu'elle est rapide, plus facile à expliquer que beaucoup d'autres modèles et donne une chance de départ en pourcentage.",
    ],
    airbyteTitle: "Comment Airbyte est utilisé",
    airbyteBody: [
      "Airbyte Cloud déplace le fichier client public vers la base Neon.",
      "Airbyte n'entraîne pas le modèle. Il charge les données. Ensuite Python nettoie les données, entraîne le modèle et sauvegarde les tables prêtes pour le tableau.",
    ],
    workflowTitle: "Étapes du projet",
    technologyTitle: "Outils utilisés",
    databaseTitle: "Tables utilisées",
    workflowSteps: [
      {
        title: "Collecter les données",
        body: "Airbyte lit le fichier client public et le charge dans Neon PostgreSQL.",
      },
      {
        title: "Stocker les données brutes",
        body: "La base garde les lignes originales pour que Python ait un point de départ propre.",
      },
      {
        title: "Nettoyer et préparer",
        body: "Python nettoie les noms de colonnes, corrige les valeurs manquantes et prépare les détails clients utiles.",
      },
      {
        title: "Entraîner le modèle",
        body: "Python entraîne un modèle qui estime la chance de départ de chaque client.",
      },
      {
        title: "Sauvegarder les tables du tableau",
        body: "Le pipeline sauvegarde les chiffres clés, les prédictions client et les raisons possibles de départ.",
      },
      {
        title: "Expliquer les résultats",
        body: "Le tableau montre les résultats, et le chatbot répond aux questions avec ces tables.",
      },
    ],
    technologies: [
      ["Airbyte Cloud", "Déplace le fichier client public vers la base."],
      ["Neon PostgreSQL", "Stocke les données brutes, propres, les prédictions et les chiffres du tableau."],
      ["GitHub Actions", "Lance le travail Python dans le cloud."],
      ["Python", "Nettoie les données et entraîne le modèle de risque de départ."],
      ["pandas", "Aide Python à nettoyer et reformater les lignes clients."],
      ["scikit-learn", "Construit le modèle de prédiction."],
      ["Next.js", "Construit les pages du tableau et les routes API."],
      ["Vercel", "Héberge l'application web."],
      ["OpenAI API", "Aide le chatbot à répondre avec des mots simples."],
    ],
    tables: [
      ["raw.customer_churn", "Lignes client originales chargées par Airbyte."],
      ["analytics.customer_health", "Lignes client propres utilisées par le tableau."],
      ["analytics.churn_predictions", "Une ligne par client avec chance de partir et niveau de risque."],
      ["analytics.kpi_summary", "Chiffres clés du tableau."],
      ["analytics.model_evaluation", "Nombres qui expliquent les cartes de score du modèle."],
      ["analytics.churn_drivers", "Détails client qui ont le plus compté pour le modèle."],
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
