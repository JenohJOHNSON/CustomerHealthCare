"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const text = {
  en: {
    idle: "Optional: refresh the source data from Airbyte.",
    starting: "Starting data refresh...",
    fallback: "The data refresh could not start. Check the Airbyte API token and connection ID.",
    success: "Data refresh started.",
    unreachable: "The data refresh route could not be reached.",
    button: "Refresh Data",
    loading: "Refreshing...",
  },
  fr: {
    idle: "Optionnel : actualiser les données source depuis Airbyte.",
    starting: "Démarrage de l'actualisation des données...",
    fallback:
      "L'actualisation des données n'a pas pu démarrer. Vérifiez le jeton API Airbyte et l'ID de connexion.",
    success: "Actualisation des données démarrée.",
    unreachable: "La route d'actualisation des données est inaccessible.",
    button: "Actualiser les données",
    loading: "Actualisation...",
  },
};

export default function AirbyteSyncButton({ lang = "en" }: { lang?: Lang }) {
  const copy = text[lang];
  const [status, setStatus] = useState(copy.idle);
  const [loading, setLoading] = useState(false);

  async function triggerSync() {
    setLoading(true);
    setStatus(copy.starting);

    try {
      const response = await fetch("/api/airbyte-sync", {
        method: "POST",
      });
      const data = (await response.json()) as {
        message?: string;
        error?: unknown;
      };

      if (!response.ok) {
        setStatus(
          typeof data.error === "string"
            ? data.error
            : copy.fallback,
        );
        return;
      }

      setStatus(data.message || copy.success);
    } catch {
      setStatus(copy.unreachable);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sync-panel">
      <button className="button-secondary" disabled={loading} onClick={triggerSync} type="button">
        {loading ? copy.loading : copy.button}
      </button>
      <span className="sync-status">{status}</span>
    </div>
  );
}
