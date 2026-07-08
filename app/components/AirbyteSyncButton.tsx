"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const text = {
  en: {
    idle: "Optional: trigger a fresh Airbyte sync.",
    starting: "Starting Airbyte sync...",
    fallback: "Airbyte sync could not be started. Check the API token and connection ID.",
    success: "Airbyte sync started.",
    unreachable: "The sync route could not be reached.",
    button: "Trigger Airbyte Sync",
    loading: "Starting...",
  },
  fr: {
    idle: "Optionnel : lancer une nouvelle synchronisation Airbyte.",
    starting: "Demarrage de la synchronisation Airbyte...",
    fallback:
      "La synchronisation Airbyte n'a pas pu demarrer. Verifiez le jeton API et l'ID de connexion.",
    success: "Synchronisation Airbyte demarree.",
    unreachable: "La route de synchronisation est inaccessible.",
    button: "Lancer la sync Airbyte",
    loading: "Demarrage...",
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
