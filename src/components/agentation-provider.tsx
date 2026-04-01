"use client";

import { Agentation } from "agentation";

const agentationEndpoint = process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT;

export function AgentationProvider() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Agentation
      endpoint={agentationEndpoint}
      className="z-[600]"
      onSessionCreated={
        agentationEndpoint
          ? (sessionId) => {
              console.info("[Agentation] Session started:", sessionId);
            }
          : undefined
      }
    />
  );
}
