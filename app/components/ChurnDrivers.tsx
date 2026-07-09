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
    labels: {
      contract: "Contract Type",
      tenure: "Months as Customer",
      monthlycharges: "Monthly Bill",
      totalcharges: "Total Paid",
      revenue_at_risk: "Monthly Bill at Risk",
      is_month_to_month: "Monthly Contract",
      gender: "Gender",
      seniorcitizen: "Senior Customer",
      partner: "Has Partner",
      dependents: "Has Dependents",
      phoneservice: "Phone Service",
      multiplelines: "Multiple Phone Lines",
      internetservice: "Internet Type",
      onlinesecurity: "Online Security",
      onlinebackup: "Online Backup",
      deviceprotection: "Device Protection",
      techsupport: "Tech Support",
      streamingtv: "Streaming TV",
      streamingmovies: "Streaming Movies",
      paperlessbilling: "Paperless Billing",
      paymentmethod: "Payment Type",
    },
    fields: {
      contract: "The type of contract the customer has.",
      tenure: "How many months the customer has stayed with the company.",
      monthlycharges: "How much the customer pays each month.",
      totalcharges: "How much the customer has paid in total.",
      revenue_at_risk: "The monthly bill connected to customers at risk.",
      is_month_to_month: "Whether the customer has a monthly contract.",
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
    fallbackField: "A customer detail used by the prediction model.",
    title: "Reason explanation",
    coefficient: "Behind-the-scenes score",
    original: "Original data column",
    meaning: "What it means",
    direction: "Effect on chance of leaving",
    why: "Plain reason",
    close: "Close",
    open: "Explain reason",
    positive:
      "This reason makes the model think the customer is more likely to leave. Customers with this detail look more like past customers who left.",
    negative:
      "This reason makes the model think the customer is less likely to leave. Customers with this detail look more like past customers who stayed.",
    neutral:
      "This reason has only a tiny effect in the model.",
    categoryMeaning: (field: string, category: string) =>
      `Customers where ${field} is ${category}.`,
    numericMeaning: (field: string) => `The numeric value for ${field}.`,
    note:
      "This shows a trend the model learned. It helps explain the prediction, but it does not prove this one reason caused a customer to leave.",
    clickHint:
      "Longer bars mean stronger reasons. Click a bar to see what it means.",
    chartAxis: "Reason strength",
    positiveShort: "Raises chance of leaving",
    negativeShort: "Lowers chance of leaving",
    neutralShort: "Nearly neutral",
  },
  fr: {
    labels: {
      contract: "Type de contrat",
      tenure: "Mois comme client",
      monthlycharges: "Facture mensuelle",
      totalcharges: "Total payé",
      revenue_at_risk: "Facture mensuelle à risque",
      is_month_to_month: "Contrat mensuel",
      gender: "Genre",
      seniorcitizen: "Client senior",
      partner: "A un partenaire",
      dependents: "A des personnes à charge",
      phoneservice: "Service téléphone",
      multiplelines: "Plusieurs lignes téléphone",
      internetservice: "Type d'internet",
      onlinesecurity: "Sécurité en ligne",
      onlinebackup: "Sauvegarde en ligne",
      deviceprotection: "Protection appareil",
      techsupport: "Support technique",
      streamingtv: "TV en streaming",
      streamingmovies: "Films en streaming",
      paperlessbilling: "Facture sans papier",
      paymentmethod: "Type de paiement",
    },
    fields: {
      contract: "Le type de contrat du client.",
      tenure: "La durée pendant laquelle le client est resté avec l'entreprise.",
      monthlycharges: "Le montant payé chaque mois par le client.",
      totalcharges: "Le montant total payé par le client.",
      revenue_at_risk: "La facture mensuelle liée aux clients à risque.",
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
    fallbackField: "Un détail client utilisé par le modèle de prédiction.",
    title: "Explication de la raison",
    coefficient: "Score interne",
    original: "Colonne de données d'origine",
    meaning: "Ce que cela signifie",
    direction: "Effet sur la chance de partir",
    why: "Raison simple",
    close: "Fermer",
    open: "Expliquer la raison",
    positive:
      "Cette raison fait penser au modèle que le client est plus susceptible de partir. Les clients avec ce profil ressemblent davantage aux clients partis dans le passé.",
    negative:
      "Cette raison fait penser au modèle que le client est moins susceptible de partir. Les clients avec ce profil ressemblent davantage aux clients restés.",
    neutral:
      "Cette raison a seulement un très petit effet dans le modèle.",
    categoryMeaning: (field: string, category: string) =>
      `Clients pour lesquels ${field} vaut ${category}.`,
    numericMeaning: (field: string) => `La valeur numérique de ${field}.`,
    note:
      "Cela montre une tendance apprise par le modèle. Cela aide à expliquer la prédiction, mais ne prouve pas que cette seule raison cause un départ.",
    clickHint:
      "Plus la barre est longue, plus la raison est forte. Cliquez sur une barre pour comprendre.",
    chartAxis: "Force de la raison",
    positiveShort: "Augmente la chance de partir",
    negativeShort: "Réduit la chance de partir",
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
  const labelKey = field as keyof typeof copy.labels;
  const readableField = copy.labels[labelKey] || titleCase(field);
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
