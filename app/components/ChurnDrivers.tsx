"use client";

import { useMemo, useState } from "react";
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
    clickHint: "Click a driver to see what it means.",
  },
  fr: {
    fields: {
      contract: "Le type de contrat du client.",
      tenure: "La duree pendant laquelle le client est reste avec l'entreprise.",
      monthlycharges: "Le montant paye chaque mois par le client.",
      totalcharges: "Le montant total paye par le client au fil du temps.",
      revenue_at_risk: "Le revenu mensuel lie aux clients a risque.",
      is_month_to_month: "Indique si le client a un contrat mensuel.",
      gender: "La categorie de genre du client dans les donnees source.",
      seniorcitizen: "Indique si le client est marque comme senior.",
      partner: "Indique si le client a un partenaire.",
      dependents: "Indique si le client a des personnes a charge.",
      phoneservice: "Indique si le client a un service telephone.",
      multiplelines: "Indique si le client a plusieurs lignes telephoniques.",
      internetservice: "Le type de service internet utilise par le client.",
      onlinesecurity: "Indique si le client a le service de securite en ligne.",
      onlinebackup: "Indique si le client a le service de sauvegarde en ligne.",
      deviceprotection: "Indique si le client a une protection appareil.",
      techsupport: "Indique si le client a le support technique.",
      streamingtv: "Indique si le client a la TV en streaming.",
      streamingmovies: "Indique si le client a les films en streaming.",
      paperlessbilling: "Indique si le client utilise la facturation sans papier.",
      paymentmethod: "La methode de paiement du client.",
    },
    fallbackField: "Un attribut client utilise par le modele de churn.",
    title: "Explication du facteur",
    coefficient: "Coefficient du modele",
    original: "Variable originale du modele",
    meaning: "Ce que cela signifie",
    direction: "Direction",
    why: "Pourquoi c'est important",
    close: "Fermer",
    open: "Expliquer le facteur",
    positive:
      "Ce facteur augmente le risque de churn predit. Les clients avec ce pattern ressemblent davantage aux clients qui ont quitte dans les donnees d'entrainement.",
    negative:
      "Ce facteur reduit le risque de churn predit. Les clients avec ce pattern ressemblent moins aux clients qui ont quitte dans les donnees d'entrainement.",
    neutral:
      "Ce facteur a une direction presque neutre dans le modele, donc son effet est faible.",
    categoryMeaning: (field: string, category: string) =>
      `Clients pour lesquels ${field} vaut ${category}.`,
    numericMeaning: (field: string) => `La valeur numerique de ${field}.`,
    note:
      "C'est une association apprise par la regression logistique. Elle aide a expliquer la prediction, mais ne prouve pas une cause directe.",
    clickHint: "Cliquez sur un facteur pour voir ce qu'il signifie.",
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

function driverStrength(driver: DriverRow, maxImportance: number) {
  const importance = Math.abs(Number(driver.importance));

  if (!maxImportance || !Number.isFinite(importance)) {
    return "0%";
  }

  return `${Math.max(8, Math.round((importance / maxImportance) * 100))}%`;
}

function directionText(value: number, lang: Lang) {
  const copy = featureDescriptions[lang];

  if (value > 0.001) return copy.positive;
  if (value < -0.001) return copy.negative;
  return copy.neutral;
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
  const selectedDriver = drivers.find((driver) => driver.feature === selectedFeature);
  const selectedExplanation = useMemo(
    () => (selectedDriver ? parseDriver(selectedDriver.feature, lang) : null),
    [lang, selectedDriver],
  );
  const selectedImportance = Number(selectedDriver?.importance || 0);

  return (
    <>
      <p className="helper-text">{copy.clickHint}</p>
      <div className="driver-list">
        {drivers.map((driver) => {
          const explanation = parseDriver(driver.feature, lang);

          return (
            <button
              className="driver-row driver-button"
              key={driver.feature}
              onClick={() => setSelectedFeature(driver.feature)}
              type="button"
            >
              <div className="driver-meta">
                <span>{explanation.readableName}</span>
                <span>{Number(driver.importance).toFixed(4)}</span>
              </div>
              <div className="driver-original">{driver.feature}</div>
              <div className="bar" aria-hidden="true">
                <div
                  className="bar-fill"
                  style={{
                    width: driverStrength(driver, maxDriverImportance),
                  }}
                />
              </div>
            </button>
          );
        })}
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
                <span>
                  {selectedImportance.toLocaleString(localeFor(lang), {
                    maximumFractionDigits: 4,
                    minimumFractionDigits: 4,
                  })}
                </span>
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
