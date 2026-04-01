"use client";

import { Agentation } from "agentation";

/**
 * Agentation's `endpoint` is the **Agent Sync** server (e.g. http://localhost:4747), not this Next.js app.
 * Pointing it at the same origin as the site causes /health and POST /sessions 404s on the app.
 */
function getAgentSyncEndpoint(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT?.trim();
  if (!raw) {
    return undefined;
  }

  const siteCandidate =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "http://localhost:3000";

  try {
    const syncUrl = new URL(raw);
    const siteUrl = new URL(
      siteCandidate.startsWith("http") ? siteCandidate : `https://${siteCandidate}`,
    );
    if (syncUrl.origin === siteUrl.origin) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  return raw;
}

const agentSyncEndpoint = getAgentSyncEndpoint();

export function AgentationProvider() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Agentation
      endpoint={agentSyncEndpoint}
      className="z-600"
      onSessionCreated={
        agentSyncEndpoint
          ? (sessionId) => {
              console.info("[Agentation] Session started:", sessionId);
            }
          : undefined
      }
    />
  );
}
