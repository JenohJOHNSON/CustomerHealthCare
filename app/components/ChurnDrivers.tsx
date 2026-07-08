"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { localeFor, type Lang } from "@/lib/i18n";

type DriverRow = {
  feature: string;
  importance: string | number;
};

type DriverExplanation = {
  category?: string;
  field: string;
  fieldDescription: string;
  readableName: string;
};

type ChartDriver = {
  absImportance: number;
  coefficientLabel: string;
  feature: string;
  importanceValue: number;
  readableName: string;
};

const featureDescriptions = {
  en: {
    fields: {
      contract: "The type of contract the customer has.",
      tenure: "How long the customer has stayed with the company.",
      monthlycharges: "How much the customer pays each month.",
      totalcharges: "How much the customer has paid over time.",
      revenue_at_risk: "The monthly revenue connected to customers at risk.",
      is_month_to_month: "Whether the customer is on a month-to-month contract.",
      gender: "The customer's gender category in the source data.",
      seniorcitizen: "Whether the customer is marked as a senior citizen.",
      partner: "Whether the customer has a partner.",
      dependents: "Whether the customer has dependents.",
      phoneservice: "Whether the customer has phone service.",
      multiplelines: "Whether the customer has multiple phone lines.",
      internetservice: "The type of internet service the customer uses.",
      onlinesecurity: "Whether the customer has online security service.",
      onlinebackup: "Whether the customer has online backup service.",
      deviceprotection: "Whether the customer has device protection.",
      techsupport: "Whether the customer has tech support.",
      streamingtv: "Whether the customer has streaming TV.",
      streamingmovies: "Whether the customer has streaming movies.",
      paperlessbilling: "Whether the customer uses paperless billing.",
      paymentmethod: "The customer's payment method.",
    },
    fallbackField: "A customer attribute used by the churn model.",
    title: "Driver explanation",
    coefficient: "Model coefficient",
    original: "Original model feature",
    meaning: "What it means",
    direction: "Direction",
    why: "Why it matters",
    close: "Close",
    open: "Explain driver",
    positive:
      "This driver pushes predicted churn risk higher. Customers with this pattern are more likely to look similar to customers who churned in the training data.",
    negative:
      "This driver pushes predicted churn risk lower. Customers with this pattern are less likely to look similar to customers who churned in the training data.",
    neutral:
      "This driver has almost no direction in the model, so its effect is small.",
    categoryMeaning: (field: string, category: string) =>
      `Customers where ${field} is ${category}.`,
    numericMeaning: (field: string) => `The numeric value for ${field}.`,
    note:
      "This is an association learned by logistic regression. It helps explain the prediction, but it does not prove direct cause and effect.",
    clickHint:
      "Bar length shows influence strength. Click a bar to see what it means.",
    chartAxis: "Influence strength",
    positiveShort: "Raises churn risk",
    negativeShort: "Lowers churn risk",
    neutralShort: "Nearly neutral",
  },
  fr: {
    fields: {
      contract: "Le type de contrat du client.",
      tenure: "La durée pendant laquelle le client est resté avec l'entreprise.",
      monthlycharges: "Le montant payé chaque mois par le client.",
      totalcharges: "Le montant total payé par le client au fil du temps.",
      revenue_at_risk: "Le revenu mensuel lié aux clients à risque.",
      is_month_to_month: "Indique si le client a un contrat mensuel.",
      gender: "La catégorie de genre du client dans les données source.",
      seniorcitizen: "Indique si le client est marqué comme senior.",
      partner: "Indique si le client a un partenaire.",
      dependents: "Indique si le client a des personnes à charge.",
      phoneservice: "Indique si le client a un service téléphone.",
      multiplelines: "Indique si le client a plusieurs lignes téléphoniques.",
      internetservice: "Le type de service internet utilisé par le client.",
      onlinesecurity: "Indique si le client a le service de sécurité en ligne.",
      onlinebackup: "Indique si le client a le service de sauvegarde en ligne.",
      deviceprotection: "Indique si le client a une protection appareil.",
      techsupport: "Indique si le client a le support technique.",
      streamingtv: "Indique si le client a la TV en streaming.",
      streamingmovies: "Indique si le client a les films en streaming.",
      paperlessbilling: "Indique si le client utilise la facturation sans papier.",
      paymentmethod: "La méthode de paiement du client.",
    },
    fallbackField: "Un attribut client utilisé par le modèle de churn.",
    title: "Explication du facteur",
    coefficient: "Coefficient du modèle",
    original: "Variable originale du modèle",
    meaning: "Ce que cela signifie",
    direction: "Direction",
    why: "Pourquoi c'est important",
    close: "Fermer",
    open: "Expliquer le facteur",
    positive:
      "Ce facteur augmente le risque de churn prédit. Les clients avec ce pattern ressemblent davantage aux clients qui ont quitté dans les données d'entraînement.",
    negative:
      "Ce facteur réduit le risque de churn prédit. Les clients avec ce pattern ressemblent moins aux clients qui ont quitté dans les données d'entraînement.",
    neutral:
      "Ce facteur a une direction presque neutre dans le modèle, donc son effet est faible.",
    categoryMeaning: (field: string, category: string) =>
      `Clients pour lesquels ${field} vaut ${category}.`,
    numericMeaning: (field: string) => `La valeur numérique de ${field}.`,
    note:
      "C'est une association apprise par la régression logistique. Elle aide à expliquer la prédiction, mais ne prouve pas une cause directe.",
    clickHint:
      "La longueur de la barre montre la force d'influence. Cliquez sur une barre pour voir ce qu'elle signifie.",
    chartAxis: "Force d'influence",
    positiveShort: "Augmente le risque de churn",
    negativeShort: "Réduit le risque de churn",
    neutralShort: "Presque neutre",
  },
};

const knownFields = [
  "is_month_to_month",
  "revenue_at_risk",
  "deviceprotection",
  "paperlessbilling",
  "internetservice",
  "onlinesecurity",
  "paymentmethod",
  "streamingmovies",
  "monthlycharges",
  "phoneservice",
  "multiplelines",
  "onlinebackup",
  "seniorcitizen",
  "streamingtv",
  "techsupport",
  "totalcharges",
  "dependents",
  "contract",
  "partner",
  "gender",
  "tenure",
];

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function parseDriver(feature: string, lang: Lang): DriverExplanation {
  const copy = featureDescriptions[lang];
  const withoutPrefix = feature.replace(/^(cat|num|bool)__/, "");
  const field =
    knownFields.find(
      (candidate) =>
        withoutPrefix === candidate || withoutPrefix.startsWith(`${candidate}_`),
    ) || withoutPrefix;
  const category =
    withoutPrefix === field ? undefined : withoutPrefix.slice(field.length + 1);
  const readableField = titleCase(field);
  const readableCategory = category ? titleCase(category) : undefined;
  const fieldKey = field as keyof typeof copy.fields;
  const fieldDescription = copy.fields[fieldKey] || copy.fallbackField;

  return {
    category: readableCategory,
    field: readableField,
    fieldDescription,
    readableName: readableCategory
      ? `${readableField}: ${readableCategory}`
      : readableField,
  };
}

function directionText(value: number, lang: Lang) {
  const copy = featureDescriptions[lang];

  if (value > 0.001) return copy.positive;
  if (value < -0.001) return copy.negative;
  return copy.neutral;
}

function shortDirectionText(value: number, lang: Lang) {
  const copy = featureDescriptions[lang];

  if (value > 0.001) return copy.positiveShort;
  if (value < -0.001) return copy.negativeShort;
  return copy.neutralShort;
}

function driverColor(value: number) {
  if (value > 0.001) return "#b42318";
  if (value < -0.001) return "#0f766e";
  return "#617064";
}

function formatCoefficient(value: number, lang: Lang) {
  return value.toLocaleString(localeFor(lang), {
    maximumFractionDigits: 4,
    minimumFractionDigits: 4,
  });
}

function getChartFeature(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  if ("feature" in value && typeof value.feature === "string") {
    return value.feature;
  }

  if ("payload" in value) {
    return getChartFeature(value.payload);
  }

  return null;
}

function DriverTooltip({
  active,
  lang,
  payload,
}: {
  active?: boolean;
  lang: Lang;
  payload?: Array<{ payload?: ChartDriver }>;
}) {
  const copy = featureDescriptions[lang];
  const row = active ? payload?.[0]?.payload : undefined;

  if (!row) {
    return null;
  }

  return (
    <div className="driver-tooltip">
      <strong>{row.readableName}</strong>
      <span>
        {copy.coefficient}: {row.coefficientLabel}
      </span>
      <span>
        {copy.direction}: {shortDirectionText(row.importanceValue, lang)}
      </span>
    </div>
  );
}

export default function ChurnDrivers({
  drivers,
  lang = "en",
  maxDriverImportance,
}: {
  drivers: DriverRow[];
  lang?: Lang;
  maxDriverImportance: number;
}) {
  const copy = featureDescriptions[lang];
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const chartData = useMemo(
    () =>
      drivers.map((driver) => {
        const explanation = parseDriver(driver.feature, lang);
        const importanceValue = Number(driver.importance);
        const safeImportance = Number.isFinite(importanceValue) ? importanceValue : 0;

        return {
          absImportance: Math.abs(safeImportance),
          coefficientLabel: formatCoefficient(safeImportance, lang),
          feature: driver.feature,
          importanceValue: safeImportance,
          readableName: explanation.readableName,
        };
      }),
    [drivers, lang],
  );
  const chartHeight = Math.max(320, chartData.length * 46 + 70);
  const domainMax = Math.max(
    maxDriverImportance,
    ...chartData.map((driver) => driver.absImportance),
    0.01,
  );
  const selectedDriver = drivers.find((driver) => driver.feature === selectedFeature);
  const selectedExplanation = useMemo(
    () => (selectedDriver ? parseDriver(selectedDriver.feature, lang) : null),
    [lang, selectedDriver],
  );
  const selectedImportance = Number(selectedDriver?.importance || 0);

  return (
    <>
      <p className="helper-text">{copy.clickHint}</p>
      <div className="driver-chart-card">
        <div className="driver-chart-scroll">
          <div className="driver-chart-canvas" style={{ height: chartHeight }}>
            <ResponsiveContainer height="100%" width="100%">
              <BarChart
                barCategoryGap={10}
                data={chartData}
                layout="vertical"
                margin={{ bottom: 28, left: 8, right: 78, top: 8 }}
              >
                <CartesianGrid horizontal={false} stroke="#dce4dc" strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  dataKey="absImportance"
                  domain={[0, domainMax]}
                  label={{
                    fill: "#617064",
                    offset: -14,
                    position: "insideBottom",
                    value: copy.chartAxis,
                  }}
                  tick={{ fill: "#617064", fontSize: 12 }}
                  tickFormatter={(value) =>
                    Number(value).toLocaleString(localeFor(lang), {
                      maximumFractionDigits: 2,
                    })
                  }
                  tickLine={false}
                  type="number"
                />
                <YAxis
                  axisLine={false}
                  dataKey="readableName"
                  interval={0}
                  tick={{ fill: "#17211b", fontSize: 12, fontWeight: 700 }}
                  tickLine={false}
                  type="category"
                  width={178}
                />
                <Tooltip
                  content={<DriverTooltip lang={lang} />}
                  cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
                />
                <Bar
                  dataKey="absImportance"
                  name={copy.chartAxis}
                  onClick={(entry) => {
                    const feature = getChartFeature(entry);

                    if (feature) {
                      setSelectedFeature(feature);
                    }
                  }}
                  radius={[0, 7, 7, 0]}
                >
                  {chartData.map((driver) => (
                    <Cell
                      fill={driverColor(driver.importanceValue)}
                      key={driver.feature}
                      stroke={selectedFeature === driver.feature ? "#17211b" : undefined}
                      strokeWidth={selectedFeature === driver.feature ? 2 : 0}
                    />
                  ))}
                  <LabelList
                    className="driver-chart-label"
                    dataKey="coefficientLabel"
                    position="right"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="driver-chart-legend">
          <span>
            <i className="legend-swatch risk-up" />
            {copy.positiveShort}
          </span>
          <span>
            <i className="legend-swatch risk-down" />
            {copy.negativeShort}
          </span>
        </div>
      </div>

      {selectedDriver && selectedExplanation ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="driver-modal-title"
            aria-modal="true"
            className="driver-modal"
            role="dialog"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{copy.title}</p>
                <h2 id="driver-modal-title">{selectedExplanation.readableName}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedFeature(null)}
                type="button"
              >
                {copy.close}
              </button>
            </div>

            <div className="definition-list">
              <p>
                <strong>{copy.meaning}</strong>
                <span>
                  {selectedExplanation.category
                    ? copy.categoryMeaning(
                        selectedExplanation.field,
                        selectedExplanation.category,
                      )
                    : copy.numericMeaning(selectedExplanation.field)}
                </span>
              </p>
              <p>
                <strong>{copy.direction}</strong>
                <span>{directionText(selectedImportance, lang)}</span>
              </p>
              <p>
                <strong>{copy.why}</strong>
                <span>{selectedExplanation.fieldDescription}</span>
              </p>
              <p>
                <strong>{copy.coefficient}</strong>
                <span>{formatCoefficient(selectedImportance, lang)}</span>
              </p>
              <p>
                <strong>{copy.original}</strong>
                <span>{selectedDriver.feature}</span>
              </p>
            </div>

            <p className="modal-note">{copy.note}</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
