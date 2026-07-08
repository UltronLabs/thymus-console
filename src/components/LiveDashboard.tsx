"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseFlags, timeAgo, verdictStyle } from "@/lib/format";
import { EmptyState, PageHeader, StatCard, VerdictBadge } from "@/components/ui";
import Chart, { type Point } from "@/components/Chart";
import SeedButton from "@/components/SeedButton";
import { useDecisionStream, type StreamedDecision } from "@/lib/useDecisionStream";
import { Inbox, Radio } from "lucide-react";

export type RangeKey = "24h" | "7d" | "30d";
export type Counts = { total: number; quarantine: number; tag: number; admit: number };

type Row = { id: string; text: string | null; channel: string; verdict: string; createdAt: string; taintFlags: string[] };

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
];

const BUCKETS: Record<RangeKey, { count: number; ms: number; label: (d: Date) => string }> = {
  "24h": { count: 12, ms: 2 * 3600_000, label: (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  "7d": { count: 7, ms: 24 * 3600_000, label: (d) => d.toLocaleDateString([], { weekday: "short" }) },
  "30d": { count: 15, ms: 2 * 24 * 3600_000, label: (d) => d.toLocaleDateString([], { month: "short", day: "numeric" }) },
};

// Fixed time buckets (not count-based), so quiet periods show as genuinely flat
// instead of being compressed away.
function buildSeries(rows: Row[], range: RangeKey): Point[] {
  const { count, ms, label } = BUCKETS[range];
  const end = Date.now();
  const out: Point[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const from = end - (i + 1) * ms;
    const to = end - i * ms;
    const inBucket = rows.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return t >= from && t < to;
    });
    out.push({
      label: label(new Date(from)),
      screened: inBucket.length,
      quarantined: inBucket.filter((r) => r.verdict === "quarantine").length,
    });
  }
  return out;
}

function topSignals(rows: Row[]): { flag: string; count: number }[] {
  const tally = new Map<string, number>();
  for (const r of rows) for (const f of parseFlags(r.taintFlags)) tally.set(f, (tally.get(f) ?? 0) + 1);
  return [...tally.entries()]
    .map(([flag, count]) => ({ flag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

const FEED_FILTERS = ["all", "quarantine", "tag", "admit"] as const;
type FeedFilter = (typeof FEED_FILTERS)[number];

export default function LiveDashboard({
  initialRows,
  prev,
  range,
}: {
  initialRows: Row[];
  prev: Counts;
  range: RangeKey;
}) {
  const [rows, setRows] = useState(initialRows);
  const [live, setLive] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>("all");

  useDecisionStream((d: StreamedDecision) => {
    setLive(true);
    setRows((p) => (p.some((r) => r.id === d.id) ? p : [{ ...d, createdAt: d.createdAt }, ...p]));
  });

  const counts: Counts = {
    total: rows.length,
    quarantine: rows.filter((r) => r.verdict === "quarantine").length,
    tag: rows.filter((r) => r.verdict === "tag").length,
    admit: rows.filter((r) => r.verdict === "admit").length,
  };

  const series = useMemo(() => buildSeries(rows, range), [rows, range]);
  const signals = useMemo(() => topSignals(rows), [rows]);
  const maxSignal = signals[0]?.count ?? 1;

  const feed = filter === "all" ? rows : rows.filter((r) => r.verdict === filter);

  const header = (
    <PageHeader
      title="Dashboard"
      subtitle="Trust & hygiene for AI agent memory"
      action={
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Radio className={`size-3.5 ${live ? "text-emerald-500" : "text-muted/50"}`} />
            {live ? "live" : "connecting…"}
          </span>
          <div className="flex rounded-lg border border-border p-0.5">
            {RANGES.map((r) => (
              <Link
                key={r.key}
                href={r.key === "24h" ? "/" : `/?range=${r.key}`}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  range === r.key ? "bg-mutedbg font-medium text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
          <SeedButton subtle />
        </div>
      }
    />
  );

  if (rows.length === 0) {
    return (
      <>
        {header}
        <div className="p-8">
          <EmptyState
            icon={<Inbox className="size-5" />}
            title={`No decisions in the last ${range}`}
            body="Point the SDK's HttpAuditSink at this console, widen the time range, or load a demo dataset to explore."
            action={<SeedButton />}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Memory writes screened" value={counts.total} delta={counts.total - prev.total} deltaLabel="vs prev" />
          <StatCard
            label="Poisoning attempts blocked"
            value={counts.quarantine}
            accent="text-rose-600 dark:text-rose-300"
            delta={counts.quarantine - prev.quarantine}
            deltaLabel="vs prev"
          />
          <StatCard
            label="Tagged (stored, flagged)"
            value={counts.tag}
            accent="text-amber-600 dark:text-amber-300"
            delta={counts.tag - prev.tag}
            deltaLabel="vs prev"
          />
          <StatCard
            label="Admitted clean"
            value={counts.admit}
            accent="text-emerald-600 dark:text-emerald-300"
            delta={counts.admit - prev.admit}
            deltaLabel="vs prev"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-foreground">Decisions over time</h2>
              <div className="flex gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" />Screened</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-400" />Quarantined</span>
              </div>
            </div>
            <Chart data={series} />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-medium text-foreground mb-1">Top threat signals</h2>
            <p className="text-xs text-muted mb-4">What the detectors flagged in this window</p>
            {signals.length === 0 ? (
              <p className="text-xs text-muted">Nothing flagged — all clean so far.</p>
            ) : (
              <div className="space-y-2.5">
                {signals.map((s) => (
                  <div key={s.flag}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <code className="text-foreground/80">{s.flag}</code>
                      <span className="text-muted tabular-nums">{s.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-mutedbg">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
                        style={{ width: `${Math.max(6, (s.count / maxSignal) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium text-foreground">Recent decisions</h2>
              <div className="flex gap-1">
                {FEED_FILTERS.map((f) => {
                  const n = f === "all" ? counts.total : counts[f];
                  const active = filter === f;
                  const dot = f !== "all" ? verdictStyle(f).dot : "";
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
                        active ? "bg-mutedbg font-medium text-foreground" : "text-muted hover:text-foreground"
                      }`}
                    >
                      {f !== "all" && <span className={`size-1.5 rounded-full ${dot}`} />}
                      {f} <span className="tabular-nums text-muted/70">{n}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <a href="/quarantine" className="text-xs text-rose-600 dark:text-rose-300 hover:underline">
              quarantine queue →
            </a>
          </div>
          {feed.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">No {filter} decisions in this window.</p>
          ) : (
            <ul className="divide-y divide-border">
              {feed.slice(0, 10).map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                  <VerdictBadge verdict={r.verdict} />
                  <span className="flex-1 min-w-0 truncate text-sm text-foreground/80">{r.text}</span>
                  <span className="text-xs text-muted shrink-0">{r.channel}</span>
                  <span className="text-xs text-muted/70 shrink-0 w-16 text-right">{timeAgo(new Date(r.createdAt))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
