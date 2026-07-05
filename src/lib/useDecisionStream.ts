"use client";

import { useEffect, useRef } from "react";

export type StreamedDecision = {
  id: string;
  agentId: string | null;
  channel: string;
  originTrustTier: string;
  text: string | null;
  verdict: string;
  trustScore: number;
  severity: string;
  taintFlags: string;
  reason: string | null;
  reviewStatus: string;
  createdAt: string;
};

// Subscribes to /api/stream (SSE) and calls onDecision for every new row.
// Auto-reconnects (EventSource does this natively) and cleans up on unmount.
export function useDecisionStream(onDecision: (d: StreamedDecision) => void) {
  const cb = useRef(onDecision);
  cb.current = onDecision;

  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.addEventListener("decision", (e) => {
      try {
        cb.current(JSON.parse((e as MessageEvent).data));
      } catch {
        // ignore malformed event
      }
    });
    return () => es.close();
  }, []);
}
