"use client";

import { useState } from "react";

export default function AirbyteSyncButton() {
  const [status, setStatus] = useState("Optional: trigger a fresh Airbyte sync.");
  const [loading, setLoading] = useState(false);

  async function triggerSync() {
    setLoading(true);
    setStatus("Starting Airbyte sync...");

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
            : "Airbyte sync could not be started. Check the API token and connection ID.",
        );
        return;
      }

      setStatus(data.message || "Airbyte sync started.");
    } catch {
      setStatus("The sync route could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sync-panel">
      <button className="button-secondary" disabled={loading} onClick={triggerSync} type="button">
        {loading ? "Starting..." : "Trigger Airbyte Sync"}
      </button>
      <span className="sync-status">{status}</span>
    </div>
  );
}
