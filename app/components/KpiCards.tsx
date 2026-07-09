"use client";

import { useEffect, useMemo, useState } from "react";
import { localeFor, type Lang } from "@/lib/i18n";

type KpiRow = {
  metric: string;
  value: string | number;
};

type ModelEvaluationRow = {
  metric: string;
  value: string | number;
};

type MetricDetail = {
  calculation: string;
  label: string;
  meaning: string;
};

type EvaluationSummary = {
  baselineAccuracy: number;
  falseNegative: number;
  falsePositive: number;
  testActualChurn: number;
  testActualNoChurn: number;
  testRows: number;
  trueNegative: number;
  truePositive: number;
};

const latestCheckedEvaluation: EvaluationSummary = {
  baselineAccuracy: 0.7348,
  falseNegative: 217,
  falsePositive: 146,
  testActualChurn: 467,
  testActualNoChurn: 1294,
  testRows: 1761,
  trueNegative: 1148,
  truePositive: 250,
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
    basisTitle: "Basis for this model score",
    testSet: "Test set used",
    formula: "Formula with this run's numbers",
    confusionMatrix: "Confusion matrix",
    baseline: "Baseline comparison",
    basisFallback:
      "This model score is calculated on the 25% holdout test set. Rerun the Python pipeline to populate the exact confusion-matrix counts in analytics.model_evaluation.",
    noNumber:
      "This value is not numeric, so the dashboard can show it but cannot calculate a numeric interpretation.",
    basisIntro: (testRows: string, noChurn: string, churn: string) =>
      `These scores are based on the 25% holdout test set, not the training rows. This run tested ${testRows} customers: ${noChurn} actual no-churn customers and ${churn} actual churn customers.`,
    baselineText: (baseline: string, score: string) =>
      `If we always predicted "No churn", the baseline accuracy would be ${baseline}. This model's accuracy is ${score}, so it performs better than that simple baseline.`,
    confusion: {
      trueNegative: "Correct no-churn predictions",
      falsePositive: "Wrong churn warnings",
      falseNegative: "Missed churn customers",
      truePositive: "Correct churn predictions",
    },
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
    basisTitle: "Base de ce score modèle",
    testSet: "Jeu de test utilisé",
    formula: "Formule avec les nombres de cette exécution",
    confusionMatrix: "Matrice de confusion",
    baseline: "Comparaison au baseline",
    basisFallback:
      "Ce score modèle est calculé sur le jeu de test de 25%. Relancez le pipeline Python pour remplir les nombres exacts de matrice de confusion dans analytics.model_evaluation.",
    noNumber:
      "Cette valeur n'est pas numérique, donc le tableau peut l'afficher mais ne peut pas produire une interprétation chiffrée.",
    basisIntro: (testRows: string, noChurn: string, churn: string) =>
      `Ces scores sont basés sur le jeu de test de 25%, pas sur les lignes d'entraînement. Cette exécution a testé ${testRows} clients : ${noChurn} vrais clients non-churn et ${churn} vrais clients churn.`,
    baselineText: (baseline: string, score: string) =>
      `Si on prédisait toujours « No churn », l'exactitude baseline serait ${baseline}. L'exactitude de ce modèle est ${score}, donc il fait mieux que ce baseline simple.`,
    confusion: {
      trueNegative: "Prédictions non-churn correctes",
      falsePositive: "Alertes churn incorrectes",
      falseNegative: "Clients churn manqués",
      truePositive: "Prédictions churn correctes",
    },
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
      maximumFractionDigits: 2,
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
    maximumFractionDigits: 2,
  })}%`;
}

function wholeNumber(value: number, lang: Lang) {
  return value.toLocaleString(localeFor(lang), {
    maximumFractionDigits: 0,
  });
}

function buildEvaluationSummary(rows: ModelEvaluationRow[]): EvaluationSummary | null {
  // Convert metric/value rows from analytics.model_evaluation into named values.
  const values = rows.reduce<Record<string, number>>((accumulator, row) => {
    const value = Number(row.value);

    if (Number.isFinite(value)) {
      accumulator[row.metric] = value;
    }

    return accumulator;
  }, {});
  const requiredMetrics = [
    "test_rows",
    "test_actual_no_churn",
    "test_actual_churn",
    "true_negative",
    "false_positive",
    "false_negative",
    "true_positive",
    "baseline_accuracy",
  ];

  if (requiredMetrics.some((metric) => values[metric] === undefined)) {
    return null;
  }

  return {
    baselineAccuracy: values.baseline_accuracy,
    falseNegative: values.false_negative,
    falsePositive: values.false_positive,
    testActualChurn: values.test_actual_churn,
    testActualNoChurn: values.test_actual_no_churn,
    testRows: values.test_rows,
    trueNegative: values.true_negative,
    truePositive: values.true_positive,
  };
}

function isCloseTo(value: string | number | undefined, expected: number) {
  const numeric = Number(value);

  return Number.isFinite(numeric) && Math.abs(numeric - expected) < 0.0002;
}

function matchesLatestCheckedRun(kpiValues: Record<string, string | number>) {
  // Fallback keeps the popup useful until the new model_evaluation table exists.
  return (
    isCloseTo(kpiValues.model_accuracy, 0.7939) &&
    isCloseTo(kpiValues.model_precision, 0.6313) &&
    isCloseTo(kpiValues.model_recall, 0.5353) &&
    isCloseTo(kpiValues.model_f1, 0.5794)
  );
}

function modelFormula({
  evaluation,
  kpiValues,
  lang,
  metric,
  value,
}: {
  evaluation: EvaluationSummary;
  kpiValues: Record<string, string | number>;
  lang: Lang;
  metric: string;
  value: string | number;
}) {
  // Show the exact formula behind each model KPI using this run's counts.
  const numeric = numericValue(value) ?? 0;
  const result = modelPercent(numeric, lang);
  const testRows = wholeNumber(evaluation.testRows, lang);
  const trueNegative = wholeNumber(evaluation.trueNegative, lang);
  const falsePositive = wholeNumber(evaluation.falsePositive, lang);
  const falseNegative = wholeNumber(evaluation.falseNegative, lang);
  const truePositive = wholeNumber(evaluation.truePositive, lang);
  const precision = numericValue(kpiValues.model_precision ?? 0) ?? 0;
  const recall = numericValue(kpiValues.model_recall ?? 0) ?? 0;
  const precisionPercent = modelPercent(precision, lang);
  const recallPercent = modelPercent(recall, lang);

  if (lang === "fr") {
    switch (metric) {
      case "model_accuracy":
        return `Exactitude = (vrais négatifs + vrais positifs) / lignes de test = (${trueNegative} + ${truePositive}) / ${testRows} = ${result}.`;
      case "model_precision":
        return `Précision = vrais positifs / (vrais positifs + faux positifs) = ${truePositive} / (${truePositive} + ${falsePositive}) = ${result}.`;
      case "model_recall":
        return `Rappel = vrais positifs / (vrais positifs + faux négatifs) = ${truePositive} / (${truePositive} + ${falseNegative}) = ${result}.`;
      case "model_f1":
        return `F1 = 2 x (précision x rappel) / (précision + rappel) = 2 x (${precisionPercent} x ${recallPercent}) / (${precisionPercent} + ${recallPercent}) = ${result}.`;
      case "model_roc_auc":
        return `ROC AUC utilise les probabilités de churn prédites sur le même jeu de test. 50% correspond au hasard, 100% à un classement parfait. Cette exécution obtient ${result}.`;
      default:
        return `Ce score est calculé sur le jeu de test de ${testRows} lignes.`;
    }
  }

  switch (metric) {
    case "model_accuracy":
      return `Accuracy = (true negatives + true positives) / test rows = (${trueNegative} + ${truePositive}) / ${testRows} = ${result}.`;
    case "model_precision":
      return `Precision = true positives / (true positives + false positives) = ${truePositive} / (${truePositive} + ${falsePositive}) = ${result}.`;
    case "model_recall":
      return `Recall = true positives / (true positives + false negatives) = ${truePositive} / (${truePositive} + ${falseNegative}) = ${result}.`;
    case "model_f1":
      return `F1 = 2 x (precision x recall) / (precision + recall) = 2 x (${precisionPercent} x ${recallPercent}) / (${precisionPercent} + ${recallPercent}) = ${result}.`;
    case "model_roc_auc":
      return `ROC AUC uses predicted churn probabilities on the same test set. 50% is random ranking, 100% is perfect ranking. This run scored ${result}.`;
    default:
      return `This score is calculated on the ${testRows}-row test set.`;
  }
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
  modelEvaluation = [],
}: {
  kpis: KpiRow[];
  lang?: Lang;
  modelEvaluation?: ModelEvaluationRow[];
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
  const liveEvaluation = useMemo(
    () => buildEvaluationSummary(modelEvaluation),
    [modelEvaluation],
  );
  const kpiValues = useMemo(
    () =>
      kpis.reduce<Record<string, string | number>>((accumulator, kpi) => {
        accumulator[kpi.metric] = kpi.value;
        return accumulator;
      }, {}),
    [kpis],
  );
  const evaluation =
    liveEvaluation ?? (matchesLatestCheckedRun(kpiValues) ? latestCheckedEvaluation : null);
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

            {selectedKpi.metric.startsWith("model_") ? (
              <section className="model-basis-card">
                <h3>{copy.basisTitle}</h3>
                {evaluation ? (
                  <>
                    <p>
                      <strong>{copy.testSet}</strong>
                      <span>
                        {copy.basisIntro(
                          wholeNumber(evaluation.testRows, lang),
                          wholeNumber(evaluation.testActualNoChurn, lang),
                          wholeNumber(evaluation.testActualChurn, lang),
                        )}
                      </span>
                    </p>
                    <p>
                      <strong>{copy.formula}</strong>
                      <span>
                        {modelFormula({
                          evaluation,
                          kpiValues,
                          lang,
                          metric: selectedKpi.metric,
                          value: selectedKpi.value,
                        })}
                      </span>
                    </p>
                    <div>
                      <strong>{copy.confusionMatrix}</strong>
                      <div className="confusion-grid">
                        <span>
                          <small>{copy.confusion.trueNegative}</small>
                          <b>{wholeNumber(evaluation.trueNegative, lang)}</b>
                        </span>
                        <span>
                          <small>{copy.confusion.falsePositive}</small>
                          <b>{wholeNumber(evaluation.falsePositive, lang)}</b>
                        </span>
                        <span>
                          <small>{copy.confusion.falseNegative}</small>
                          <b>{wholeNumber(evaluation.falseNegative, lang)}</b>
                        </span>
                        <span>
                          <small>{copy.confusion.truePositive}</small>
                          <b>{wholeNumber(evaluation.truePositive, lang)}</b>
                        </span>
                      </div>
                    </div>
                    {selectedKpi.metric === "model_accuracy" ? (
                      <p>
                        <strong>{copy.baseline}</strong>
                        <span>
                          {copy.baselineText(
                            modelPercent(evaluation.baselineAccuracy, lang),
                            selectedFormattedValue,
                          )}
                        </span>
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p>
                    <strong>{copy.testSet}</strong>
                    <span>{copy.basisFallback}</span>
                  </p>
                )}
              </section>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
