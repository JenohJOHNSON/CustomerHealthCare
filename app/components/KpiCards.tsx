"use client";

import { useEffect, useMemo, useState } from "react";
import { localeFor, type Lang } from "@/lib/i18n";

type KpiRow = {
  metric: string;
  value: string | number;
};

type MetricDetail = {
  calculation: string;
  label: string;
  meaning: string;
};

const text = {
  en: {
    clickHint: "Click any KPI card to see what the number means.",
    modalTitle: "KPI explanation",
    currentNumber: "Current number",
    meaning: "What this KPI means",
    calculation: "How it is calculated",
    numberMeaning: "What this number tells us",
    close: "Close",
    open: "Explain KPI",
    noNumber:
      "This value is not numeric, so the dashboard can show it but cannot calculate a numeric interpretation.",
    fallback: {
      meaning: "A dashboard metric written by the analytics pipeline.",
      calculation:
        "This value comes from analytics.kpi_summary after the Python pipeline finishes.",
    },
    metrics: {
      total_customers: {
        label: "Total customers",
        meaning: "The number of cleaned customer records included in the analysis.",
        calculation: "Count every row in the cleaned customer dataset.",
      },
      actual_churn_rate_percent: {
        label: "Actual churn rate",
        meaning: "The percent of customers in the historical data who actually churned.",
        calculation:
          "Count customers where Churn is Yes, divide by total customers, then multiply by 100.",
      },
      avg_churn_probability_percent: {
        label: "Average churn probability",
        meaning:
          "The average churn risk predicted by the machine learning model across all customers.",
        calculation:
          "Average every customer's predicted churn probability, then multiply by 100.",
      },
      high_risk_customers: {
        label: "High-risk customers",
        meaning: "The number of customers the model labels as high risk.",
        calculation:
          "Count customers whose predicted churn probability is 70% or higher.",
      },
      monthly_revenue_at_risk: {
        label: "Monthly revenue at risk",
        meaning:
          "The monthly charges connected to customers currently labeled as high risk.",
        calculation: "Add monthly charges for all high-risk customers.",
      },
      model_accuracy: {
        label: "Model accuracy",
        meaning:
          "How often the model made the correct churn or no-churn prediction on test data.",
        calculation: "Correct predictions divided by all test predictions.",
      },
      model_precision: {
        label: "Model precision",
        meaning:
          "When the model predicts churn, precision shows how often that warning is correct.",
        calculation:
          "True churn predictions divided by all customers predicted as churn.",
      },
      model_recall: {
        label: "Model recall",
        meaning:
          "Recall shows how many actual churn customers the model successfully found.",
        calculation:
          "True churn predictions divided by all customers who actually churned.",
      },
      model_f1: {
        label: "Model F1 score",
        meaning:
          "A balanced score that combines precision and recall into one model-quality number.",
        calculation: "The harmonic mean of precision and recall.",
      },
      model_roc_auc: {
        label: "Model ROC AUC",
        meaning:
          "How well the model ranks churn-risk customers above lower-risk customers.",
        calculation:
          "Area under the ROC curve. 50% is random guessing, and 100% is perfect ranking.",
      },
    },
  },
  fr: {
    clickHint:
      "Cliquez sur une carte KPI pour comprendre ce que signifie le nombre.",
    modalTitle: "Explication du KPI",
    currentNumber: "Nombre actuel",
    meaning: "Ce que ce KPI signifie",
    calculation: "Comment il est calculé",
    numberMeaning: "Ce que ce nombre nous dit",
    close: "Fermer",
    open: "Expliquer le KPI",
    noNumber:
      "Cette valeur n'est pas numérique, donc le tableau peut l'afficher mais ne peut pas produire une interprétation chiffrée.",
    fallback: {
      meaning: "Une métrique du tableau écrite par le pipeline analytics.",
      calculation:
        "Cette valeur vient de analytics.kpi_summary après l'exécution du pipeline Python.",
    },
    metrics: {
      total_customers: {
        label: "Clients totaux",
        meaning: "Le nombre de lignes client nettoyées incluses dans l'analyse.",
        calculation: "Compter chaque ligne du jeu de données client nettoyé.",
      },
      actual_churn_rate_percent: {
        label: "Taux de churn réel",
        meaning:
          "Le pourcentage de clients des données historiques qui ont vraiment quitté.",
        calculation:
          "Compter les clients où Churn vaut Yes, diviser par le total des clients, puis multiplier par 100.",
      },
      avg_churn_probability_percent: {
        label: "Probabilité moyenne de churn",
        meaning:
          "Le risque moyen de churn prédit par le modèle de machine learning pour tous les clients.",
        calculation:
          "Faire la moyenne des probabilités de churn prédites, puis multiplier par 100.",
      },
      high_risk_customers: {
        label: "Clients à haut risque",
        meaning: "Le nombre de clients que le modèle classe comme haut risque.",
        calculation:
          "Compter les clients dont la probabilité de churn prédite est de 70% ou plus.",
      },
      monthly_revenue_at_risk: {
        label: "Revenu mensuel à risque",
        meaning:
          "Les charges mensuelles liées aux clients actuellement classés à haut risque.",
        calculation:
          "Additionner les charges mensuelles de tous les clients à haut risque.",
      },
      model_accuracy: {
        label: "Exactitude du modèle",
        meaning:
          "La fréquence à laquelle le modèle prédit correctement churn ou non-churn sur les données de test.",
        calculation:
          "Prédictions correctes divisées par toutes les prédictions de test.",
      },
      model_precision: {
        label: "Précision du modèle",
        meaning:
          "Quand le modèle prédit churn, la précision indique à quelle fréquence cette alerte est correcte.",
        calculation:
          "Vraies prédictions de churn divisées par tous les clients prédits comme churn.",
      },
      model_recall: {
        label: "Rappel du modèle",
        meaning:
          "Le rappel indique combien de vrais clients churn le modèle a réussi à trouver.",
        calculation:
          "Vraies prédictions de churn divisées par tous les clients qui ont vraiment churné.",
      },
      model_f1: {
        label: "Score F1 du modèle",
        meaning:
          "Un score équilibré qui combine précision et rappel dans un seul nombre de qualité du modèle.",
        calculation: "La moyenne harmonique de la précision et du rappel.",
      },
      model_roc_auc: {
        label: "ROC AUC du modèle",
        meaning:
          "La capacité du modèle à classer les clients à risque de churn au-dessus des clients moins risqués.",
        calculation:
          "Aire sous la courbe ROC. 50% correspond au hasard, et 100% à un classement parfait.",
      },
    },
  },
};

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function numericValue(value: string | number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatMetricValue(metric: string, value: string | number, lang: Lang) {
  const numeric = numericValue(value);
  const locale = localeFor(lang);

  if (numeric === null) {
    return String(value);
  }

  if (metric.includes("percent")) {
    return `${numeric.toLocaleString(locale, {
      maximumFractionDigits: 2,
    })}%`;
  }

  if (metric.includes("revenue")) {
    return numeric.toLocaleString(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  if (metric.startsWith("model_")) {
    const score = numeric <= 1 ? numeric * 100 : numeric;

    return `${score.toLocaleString(locale, {
      maximumFractionDigits: 1,
    })}%`;
  }

  return numeric.toLocaleString(locale, {
    maximumFractionDigits: 2,
  });
}

function getMetricDetail(metric: string, lang: Lang): MetricDetail {
  const copy = text[lang];
  const details = copy.metrics as Record<string, MetricDetail>;
  const detail = details[metric];

  if (detail) {
    return detail;
  }

  return {
    label: titleCase(metric),
    meaning: copy.fallback.meaning,
    calculation: copy.fallback.calculation,
  };
}

function percentCount(value: number, lang: Lang) {
  return Math.round(value).toLocaleString(localeFor(lang));
}

function modelPercent(value: number, lang: Lang) {
  const score = value <= 1 ? value * 100 : value;

  return `${score.toLocaleString(localeFor(lang), {
    maximumFractionDigits: 1,
  })}%`;
}

function explainValue(metric: string, value: string | number, formatted: string, lang: Lang) {
  const numeric = numericValue(value);
  const copy = text[lang];

  if (numeric === null) {
    return copy.noNumber;
  }

  if (lang === "fr") {
    switch (metric) {
      case "total_customers":
        return `${formatted} signifie que le pipeline a analysé ${formatted} lignes client nettoyées. Les KPI et les prédictions du tableau reposent sur ces clients.`;
      case "actual_churn_rate_percent":
        return `${formatted} signifie qu'environ ${percentCount(numeric, lang)} clients sur 100 ont vraiment quitté dans les données historiques.`;
      case "avg_churn_probability_percent":
        return `${formatted} signifie que, en moyenne, le modèle estime ce niveau de risque de churn pour l'ensemble des clients.`;
      case "high_risk_customers":
        return `${formatted} clients ont une probabilité de churn prédite de 70% ou plus. Ce sont les clients à regarder en priorité.`;
      case "monthly_revenue_at_risk":
        return `${formatted} représente le revenu mensuel exposé si les clients à haut risque quittent le service.`;
      case "model_accuracy":
        return `${formatted} signifie que le modèle a donné une réponse correcte environ ${modelPercent(numeric, lang)} du temps sur les données de test.`;
      case "model_precision":
        return `${formatted} signifie que, parmi les clients signalés comme churn probable, environ ${modelPercent(numeric, lang)} étaient réellement des churners dans le test.`;
      case "model_recall":
        return `${formatted} signifie que le modèle a retrouvé environ ${modelPercent(numeric, lang)} des vrais clients churn dans le test.`;
      case "model_f1":
        return `${formatted} résume l'équilibre entre précision et rappel. Plus le score est proche de 100%, meilleur est cet équilibre.`;
      case "model_roc_auc":
        return `${formatted} montre la qualité du classement du modèle. Plus ce nombre est proche de 100%, mieux le modèle sépare les clients à risque des autres.`;
      default:
        return `${formatted} est la valeur actuelle écrite par le pipeline analytics pour ce KPI.`;
    }
  }

  switch (metric) {
    case "total_customers":
      return `${formatted} means the pipeline analyzed ${formatted} cleaned customer records. The dashboard KPIs and predictions are based on these customers.`;
    case "actual_churn_rate_percent":
      return `${formatted} means about ${percentCount(numeric, lang)} out of every 100 customers actually churned in the historical data.`;
    case "avg_churn_probability_percent":
      return `${formatted} means the model estimates this average churn risk across all customers.`;
    case "high_risk_customers":
      return `${formatted} customers have a predicted churn probability of 70% or higher. These are the customers to review first.`;
    case "monthly_revenue_at_risk":
      return `${formatted} is the monthly revenue exposed if the high-risk customers leave the service.`;
    case "model_accuracy":
      return `${formatted} means the model gave the correct answer about ${modelPercent(numeric, lang)} of the time on test data.`;
    case "model_precision":
      return `${formatted} means that, among customers flagged as likely churners, about ${modelPercent(numeric, lang)} were actually churners in the test set.`;
    case "model_recall":
      return `${formatted} means the model found about ${modelPercent(numeric, lang)} of the true churn customers in the test set.`;
    case "model_f1":
      return `${formatted} summarizes the balance between precision and recall. Closer to 100% means a stronger balance.`;
    case "model_roc_auc":
      return `${formatted} shows ranking quality. Closer to 100% means the model is better at ranking high-risk customers above lower-risk customers.`;
    default:
      return `${formatted} is the current value written by the analytics pipeline for this KPI.`;
  }
}

export default function KpiCards({
  kpis,
  lang = "en",
}: {
  kpis: KpiRow[];
  lang?: Lang;
}) {
  const copy = text[lang];
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const selectedKpi = kpis.find((kpi) => kpi.metric === selectedMetric);
  const selectedDetail = selectedKpi
    ? getMetricDetail(selectedKpi.metric, lang)
    : null;
  const selectedFormattedValue = selectedKpi
    ? formatMetricValue(selectedKpi.metric, selectedKpi.value, lang)
    : "";
  const selectedNumberMeaning = selectedKpi
    ? explainValue(selectedKpi.metric, selectedKpi.value, selectedFormattedValue, lang)
    : "";
  const renderedKpis = useMemo(
    () =>
      kpis.map((kpi) => ({
        ...kpi,
        detail: getMetricDetail(kpi.metric, lang),
        formattedValue: formatMetricValue(kpi.metric, kpi.value, lang),
      })),
    [kpis, lang],
  );

  useEffect(() => {
    if (!selectedMetric) return undefined;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedMetric(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedMetric]);

  return (
    <>
      <p className="helper-text">{copy.clickHint}</p>
      <div className="kpi-grid">
        {renderedKpis.map((kpi) => (
          <button
            aria-label={`${copy.open}: ${kpi.detail.label}`}
            aria-haspopup="dialog"
            className="kpi-card kpi-button"
            key={kpi.metric}
            onClick={() => setSelectedMetric(kpi.metric)}
            type="button"
          >
            <p className="kpi-label">{kpi.detail.label}</p>
            <p className="kpi-value">{kpi.formattedValue}</p>
          </button>
        ))}
      </div>

      {selectedKpi && selectedDetail ? (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedMetric(null)}
          role="presentation"
        >
          <section
            aria-labelledby="kpi-modal-title"
            aria-modal="true"
            className="kpi-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{copy.modalTitle}</p>
                <h2 id="kpi-modal-title">{selectedDetail.label}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedMetric(null)}
                type="button"
              >
                {copy.close}
              </button>
            </div>

            <div className="modal-kpi-value">
              <span>{copy.currentNumber}</span>
              <strong>{selectedFormattedValue}</strong>
            </div>

            <div className="definition-list">
              <p>
                <strong>{copy.meaning}</strong>
                <span>{selectedDetail.meaning}</span>
              </p>
              <p>
                <strong>{copy.calculation}</strong>
                <span>{selectedDetail.calculation}</span>
              </p>
              <p>
                <strong>{copy.numberMeaning}</strong>
                <span>{selectedNumberMeaning}</span>
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
