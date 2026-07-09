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
    clickHint: "Click any number card to see what it means.",
    modalTitle: "Number explanation",
    currentNumber: "Number shown",
    meaning: "What this number means",
    calculation: "How we get this number",
    numberMeaning: "What this tells us",
    close: "Close",
    open: "Explain this number",
    basisTitle: "Where this model score comes from",
    testSet: "Rows used to test the model",
    formula: "Formula with this run's numbers",
    confusionMatrix: "Prediction result counts",
    baseline: "Simple comparison",
    basisFallback:
      "This model score is calculated on the 25% of customers saved for testing. Rerun the Python data job to fill the exact prediction counts.",
    noNumber:
      "This value is not numeric, so the dashboard can show it but cannot calculate a numeric interpretation.",
    basisIntro: (testRows: string, noChurn: string, churn: string) =>
      `These scores come from customers the model did not train on. This run tested ${testRows} customers: ${noChurn} customers stayed and ${churn} customers left.`,
    baselineText: (baseline: string, score: string) =>
      `If we simply guessed every customer would stay, the score would be ${baseline}. This model scored ${score}, so it did better than that simple guess.`,
    confusion: {
      trueNegative: "Correctly said stayed",
      falsePositive: "Warned leave, but stayed",
      falseNegative: "Missed customers who left",
      truePositive: "Correctly found leavers",
    },
    fallback: {
      meaning: "A number created by the data pipeline for the dashboard.",
      calculation:
        "This value is saved after the Python pipeline finishes.",
    },
    metrics: {
      total_customers: {
        label: "Customers",
        meaning: "The number of customer rows included after cleaning the data.",
        calculation: "Count every clean customer row.",
      },
      actual_churn_rate_percent: {
        label: "Customers who really left",
        meaning: "The percent of customers in the data who actually stopped service.",
        calculation:
          "Count customers marked Yes for leaving, divide by all customers, then multiply by 100.",
      },
      avg_churn_probability_percent: {
        label: "Average chance of leaving",
        meaning:
          "The average chance of leaving predicted by the model across all customers.",
        calculation:
          "Average every customer's predicted chance of leaving, then multiply by 100.",
      },
      high_risk_customers: {
        label: "Likely to leave",
        meaning: "The number of customers the model says are likely to leave.",
        calculation:
          "Count customers whose predicted chance of leaving is 70% or higher.",
      },
      monthly_revenue_at_risk: {
        label: "Monthly bill at risk",
        meaning:
          "The monthly bills connected to customers currently likely to leave.",
        calculation: "Add monthly bills for all customers likely to leave.",
      },
      model_accuracy: {
        label: "Model correct rate",
        meaning:
          "How often the model was right when tested on customers it had not trained on.",
        calculation: "Correct predictions divided by all test predictions.",
      },
      model_precision: {
        label: "Warning accuracy",
        meaning:
          "When the model warns that a customer may leave, this shows how often that warning is right.",
        calculation:
          "Correct leave warnings divided by all leave warnings.",
      },
      model_recall: {
        label: "Leaver catch rate",
        meaning:
          "How many customers who really left were caught by the model.",
        calculation:
          "Correctly found leavers divided by all customers who really left.",
      },
      model_f1: {
        label: "Model balance score",
        meaning:
          "One score that balances warning accuracy and leaver catch rate.",
        calculation: "A balanced average of warning accuracy and leaver catch rate.",
      },
      model_roc_auc: {
        label: "Risk ranking score",
        meaning:
          "How well the model ranks customers who may leave above customers who are safer.",
        calculation:
          "A ranking score where 50% is random guessing and 100% is perfect ranking.",
      },
    },
  },
  fr: {
    clickHint:
      "Cliquez sur une carte de chiffre pour comprendre ce que signifie le nombre.",
    modalTitle: "Explication du chiffre",
    currentNumber: "Nombre affiché",
    meaning: "Ce que ce nombre signifie",
    calculation: "Comment on obtient ce nombre",
    numberMeaning: "Ce que ce nombre nous dit",
    close: "Fermer",
    open: "Expliquer ce nombre",
    basisTitle: "D'où vient ce score du modèle",
    testSet: "Lignes utilisées pour tester le modèle",
    formula: "Formule avec les nombres de cette exécution",
    confusionMatrix: "Résultats de prédiction",
    baseline: "Comparaison simple",
    basisFallback:
      "Ce score modèle est calculé sur les 25% de clients gardés pour le test. Relancez le travail Python pour remplir les nombres exacts de prédiction.",
    noNumber:
      "Cette valeur n'est pas numérique, donc le tableau peut l'afficher mais ne peut pas produire une interprétation chiffrée.",
    basisIntro: (testRows: string, noChurn: string, churn: string) =>
      `Ces scores viennent de clients que le modèle n'a pas utilisés pour apprendre. Cette exécution a testé ${testRows} clients : ${noChurn} clients sont restés et ${churn} clients sont partis.`,
    baselineText: (baseline: string, score: string) =>
      `Si on devinait simplement que chaque client reste, le score serait ${baseline}. Ce modèle a obtenu ${score}, donc il fait mieux que cette supposition simple.`,
    confusion: {
      trueNegative: "A bien dit reste",
      falsePositive: "A prévenu départ, mais le client est resté",
      falseNegative: "A manqué des clients partis",
      truePositive: "A bien trouvé les départs",
    },
    fallback: {
      meaning: "Un nombre créé par le pipeline pour le tableau.",
      calculation:
        "Cette valeur est sauvegardée après l'exécution du pipeline Python.",
    },
    metrics: {
      total_customers: {
        label: "Clients",
        meaning: "Le nombre de lignes client gardées après le nettoyage des données.",
        calculation: "Compter chaque ligne client propre.",
      },
      actual_churn_rate_percent: {
        label: "Clients vraiment partis",
        meaning:
          "Le pourcentage de clients qui ont vraiment arrêté le service dans les données.",
        calculation:
          "Compter les clients marqués Yes pour le départ, diviser par tous les clients, puis multiplier par 100.",
      },
      avg_churn_probability_percent: {
        label: "Chance moyenne de partir",
        meaning:
          "La chance moyenne de départ prédite par le modèle pour tous les clients.",
        calculation:
          "Faire la moyenne des chances de départ prédites, puis multiplier par 100.",
      },
      high_risk_customers: {
        label: "Susceptibles de partir",
        meaning: "Le nombre de clients que le modèle pense susceptibles de partir.",
        calculation:
          "Compter les clients dont la chance de départ prédite est de 70% ou plus.",
      },
      monthly_revenue_at_risk: {
        label: "Facture mensuelle à risque",
        meaning:
          "Les factures mensuelles liées aux clients actuellement susceptibles de partir.",
        calculation:
          "Additionner les factures mensuelles de tous les clients susceptibles de partir.",
      },
      model_accuracy: {
        label: "Taux de bonnes réponses",
        meaning:
          "La fréquence à laquelle le modèle a raison sur des clients qu'il n'a pas utilisés pour apprendre.",
        calculation:
          "Prédictions correctes divisées par toutes les prédictions de test.",
      },
      model_precision: {
        label: "Qualité des alertes",
        meaning:
          "Quand le modèle prévient qu'un client peut partir, ce score montre combien de fois l'alerte est correcte.",
        calculation:
          "Alertes départ correctes divisées par toutes les alertes départ.",
      },
      model_recall: {
        label: "Départs retrouvés",
        meaning:
          "Combien de clients vraiment partis ont été trouvés par le modèle.",
        calculation:
          "Départs correctement trouvés divisés par tous les clients vraiment partis.",
      },
      model_f1: {
        label: "Score d'équilibre",
        meaning:
          "Un score qui équilibre la qualité des alertes et les départs retrouvés.",
        calculation: "Une moyenne équilibrée entre qualité des alertes et départs retrouvés.",
      },
      model_roc_auc: {
        label: "Score de classement du risque",
        meaning:
          "La capacité du modèle à placer les clients qui peuvent partir au-dessus des clients plus sûrs.",
        calculation:
          "Un score de classement où 50% correspond au hasard et 100% à un classement parfait.",
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
  // Show the exact formula behind each model score using this run's counts.
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
        return `Taux de bonnes réponses = (clients restés bien prédits + clients partis bien prédits) / lignes de test = (${trueNegative} + ${truePositive}) / ${testRows} = ${result}.`;
      case "model_precision":
        return `Qualité des alertes = départs bien trouvés / toutes les alertes départ = ${truePositive} / (${truePositive} + ${falsePositive}) = ${result}.`;
      case "model_recall":
        return `Départs retrouvés = départs bien trouvés / tous les vrais départs = ${truePositive} / (${truePositive} + ${falseNegative}) = ${result}.`;
      case "model_f1":
        return `Score d'équilibre = 2 x (qualité des alertes x départs retrouvés) / (qualité des alertes + départs retrouvés) = 2 x (${precisionPercent} x ${recallPercent}) / (${precisionPercent} + ${recallPercent}) = ${result}.`;
      case "model_roc_auc":
        return `Le score de classement utilise les chances de départ prédites sur le même jeu de test. 50% correspond au hasard, 100% à un classement parfait. Cette exécution obtient ${result}.`;
      default:
        return `Ce score est calculé sur le jeu de test de ${testRows} lignes.`;
    }
  }

  switch (metric) {
    case "model_accuracy":
      return `Correct rate = (correctly predicted stay + correctly predicted leave) / test rows = (${trueNegative} + ${truePositive}) / ${testRows} = ${result}.`;
    case "model_precision":
      return `Warning accuracy = correctly found leavers / all leave warnings = ${truePositive} / (${truePositive} + ${falsePositive}) = ${result}.`;
    case "model_recall":
      return `Leaver catch rate = correctly found leavers / all real leavers = ${truePositive} / (${truePositive} + ${falseNegative}) = ${result}.`;
    case "model_f1":
      return `Balance score = 2 x (warning accuracy x leaver catch rate) / (warning accuracy + leaver catch rate) = 2 x (${precisionPercent} x ${recallPercent}) / (${precisionPercent} + ${recallPercent}) = ${result}.`;
    case "model_roc_auc":
      return `Risk ranking uses predicted chances of leaving on the same test set. 50% is random ranking, 100% is perfect ranking. This run scored ${result}.`;
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
        return `${formatted} signifie que le pipeline a analysé ${formatted} lignes client nettoyées. Les chiffres et les prédictions du tableau reposent sur ces clients.`;
      case "actual_churn_rate_percent":
        return `${formatted} signifie qu'environ ${percentCount(numeric, lang)} clients sur 100 ont vraiment quitté dans les données historiques.`;
      case "avg_churn_probability_percent":
        return `${formatted} signifie que, en moyenne, le modèle estime cette chance de départ pour l'ensemble des clients.`;
      case "high_risk_customers":
        return `${formatted} clients ont une chance de départ prédite de 70% ou plus. Ce sont les clients à regarder en priorité.`;
      case "monthly_revenue_at_risk":
        return `${formatted} représente le revenu mensuel exposé si les clients à haut risque quittent le service.`;
      case "model_accuracy":
        return `${formatted} signifie que le modèle a donné une bonne réponse environ ${modelPercent(numeric, lang)} du temps sur les données de test.`;
      case "model_precision":
        return `${formatted} signifie que, parmi les clients signalés comme susceptibles de partir, environ ${modelPercent(numeric, lang)} sont vraiment partis dans le test.`;
      case "model_recall":
        return `${formatted} signifie que le modèle a retrouvé environ ${modelPercent(numeric, lang)} des clients vraiment partis dans le test.`;
      case "model_f1":
        return `${formatted} résume l'équilibre entre la qualité des alertes et les départs retrouvés. Plus le score est proche de 100%, meilleur est cet équilibre.`;
      case "model_roc_auc":
        return `${formatted} montre la qualité du classement du modèle. Plus ce nombre est proche de 100%, mieux le modèle sépare les clients à risque des autres.`;
      default:
        return `${formatted} est la valeur actuelle écrite par le pipeline pour ce chiffre du tableau.`;
    }
  }

  switch (metric) {
    case "total_customers":
      return `${formatted} means the pipeline analyzed ${formatted} cleaned customer records. The dashboard numbers and predictions are based on these customers.`;
    case "actual_churn_rate_percent":
      return `${formatted} means about ${percentCount(numeric, lang)} out of every 100 customers actually left in the historical data.`;
    case "avg_churn_probability_percent":
      return `${formatted} means the model estimates this average chance of leaving across all customers.`;
    case "high_risk_customers":
      return `${formatted} customers have a predicted chance of leaving of 70% or higher. These are the customers to review first.`;
    case "monthly_revenue_at_risk":
      return `${formatted} is the monthly money exposed if the likely-to-leave customers leave the service.`;
    case "model_accuracy":
      return `${formatted} means the model gave the right answer about ${modelPercent(numeric, lang)} of the time on test data.`;
    case "model_precision":
      return `${formatted} means that, among customers warned as likely to leave, about ${modelPercent(numeric, lang)} really left in the test set.`;
    case "model_recall":
      return `${formatted} means the model found about ${modelPercent(numeric, lang)} of the customers who really left in the test set.`;
    case "model_f1":
      return `${formatted} summarizes the balance between warning accuracy and leaver catch rate. Closer to 100% means a stronger balance.`;
    case "model_roc_auc":
      return `${formatted} shows ranking quality. Closer to 100% means the model is better at ranking customers who may leave above customers who are safer.`;
    default:
      return `${formatted} is the current value written by the data pipeline for this dashboard number.`;
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
