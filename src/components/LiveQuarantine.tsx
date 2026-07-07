"use client";

import { useMemo, useState } from "react";
import { parseFlags, timeAgo } from "@/lib/format";
import { PageHeader, Flags } from "@/components/ui";
import ReviewButtons from "@/components/ReviewButtons";
import { useDecisionStream, type StreamedDecision } from "@/lib/useDecisionStream";
import { Radio } from "lucide-react";

type PendingRow = {
  id: string; text: string | null; agentId: string | null; channel: string;
  originTrustTier: string; taintFlags: string; reason: string | null; createdAt: string;
};
type ResolvedRow = { id: string; text: string | null; reviewStatus: string; reviewedAt: string | null };

export default function LiveQuarantine({
  initialPending,
  resolved,
}: {
  initialPending: PendingRow[];
  resolved: ResolvedRow[];
}) {
  const [extra, setExtra] = useState<PendingRow[]>([]);
  const [live, setLive] = useState(false);

  useDecisionStream((d: StreamedDecision) => {
    setLive(true);
    if (d.verdict !== "quarantine" || d.reviewStatus !== "pending") return;
    setExtra((prev) => (prev.some((x) => x.id === d.id) ? prev : [d, ...prev]));
  });

  // De-duplicate against whatever the server most recently rendered (e.g. after
  // a review action revalidates the page) so a streamed item never double-shows
  // once it's part of the server-rendered set.
  const pending = useMemo(() => {
    const ids = new Set(initialPending.map((p) => p.id));
    return [...extra.filter((e) => !ids.has(e.id)), ...initialPending];
  }, [initialPending, extra]);

  return (
    <>
      <PageHeader
        title="Quarantine review"
        subtitle={`${pending.length} held ${pending.length === 1 ? "memory" : "memories"} awaiting a human decision`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Radio className={`size-3.5 ${live ? "text-emerald-500" : "text-muted/50"}`} />
            {live ? "live" : "connecting…"}
          </span>
        }
      />
      <div className="p-8 space-y-8">
        {pending.length === 0 ? (
          <p className="text-muted text-sm">Nothing in the queue. Blocked poison shows up here for triage.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="rounded-xl border border-rose-500/25 bg-rose-500/[0.04] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">&ldquo;{r.text}&rdquo;</p>
                    <p className="text-xs text-muted mt-1">
                      {r.agentId} · {r.channel} · origin <span className="text-foreground/80">{r.originTrustTier}</span> · {timeAgo(new Date(r.createdAt))}
                    </p>
                  </div>
                  <ReviewButtons id={r.id} />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Flags flags={parseFlags(r.taintFlags)} />
                </div>
                {r.reason && <p className="text-xs text-muted mt-2">{r.reason}</p>}
              </li>
            ))}
          </ul>
        )}

        {resolved.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted mb-3">Recently resolved</h2>
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {resolved.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-xs font-medium text-foreground/80 w-24 capitalize">{r.reviewStatus.replace("_", " ")}</span>
                  <span className="flex-1 min-w-0 truncate text-sm text-muted">{r.text}</span>
                  <span className="text-xs text-muted/70">{r.reviewedAt ? timeAgo(new Date(r.reviewedAt)) : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
