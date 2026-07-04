import { prisma } from "@/lib/prisma";
import { DEFAULT_TENANT } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { PageHeader, StatCard, VerdictBadge } from "@/components/ui";
import Chart, { type Point } from "@/components/Chart";
import SeedButton from "@/components/SeedButton";

export const dynamic = "force-dynamic";

function buildSeries(rows: { createdAt: Date; verdict: string }[]): Point[] {
  if (rows.length === 0) return [];
  const asc = [...rows].reverse();
  const buckets = 8;
  const size = Math.ceil(asc.length / buckets);
  const out: Point[] = [];
  for (let i = 0; i < asc.length; i += size) {
    const slice = asc.slice(i, i + size);
    out.push({
      label: new Date(slice[0].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      screened: slice.length,
      quarantined: slice.filter((r) => r.verdict === "quarantine").length,
    });
  }
  return out;
}

export default async function Dashboard() {
  const rows = await prisma.decision.findMany({
    where: { tenantId: DEFAULT_TENANT },
    orderBy: { createdAt: "desc" },
  });

  const total = rows.length;
  const quarantined = rows.filter((r) => r.verdict === "quarantine").length;
  const tagged = rows.filter((r) => r.verdict === "tag").length;
  const admitted = rows.filter((r) => r.verdict === "admit").length;
  const pending = rows.filter((r) => r.verdict === "quarantine" && r.reviewStatus === "pending").length;

  if (total === 0) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Trust & hygiene for AI agent memory" />
        <div className="grid place-items-center py-32 text-center">
          <div>
            <p className="text-slate-400 mb-4">No decisions yet. Load a demo dataset to explore the console.</p>
            <SeedButton />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Trust & hygiene for AI agent memory"
        action={<SeedButton subtle />}
      />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Memory writes screened" value={total} />
          <StatCard label="Poisoning attempts blocked" value={quarantined} accent="text-rose-300" />
          <StatCard label="Tagged (stored, flagged)" value={tagged} accent="text-amber-300" />
          <StatCard label="Admitted clean" value={admitted} accent="text-emerald-300" />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-slate-300">Decisions over time</h2>
            <div className="flex gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" />Screened</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-400" />Quarantined</span>
            </div>
          </div>
          <Chart data={buildSeries(rows)} />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
            <h2 className="text-sm font-medium text-slate-300">Recent decisions</h2>
            {pending > 0 && (
              <a href="/quarantine" className="text-xs text-rose-300 hover:underline">
                {pending} awaiting review →
              </a>
            )}
          </div>
          <ul className="divide-y divide-slate-800/70">
            {rows.slice(0, 8).map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                <VerdictBadge verdict={r.verdict} />
                <span className="flex-1 min-w-0 truncate text-sm text-slate-300">{r.text}</span>
                <span className="text-xs text-slate-500 shrink-0">{r.channel}</span>
                <span className="text-xs text-slate-600 shrink-0 w-16 text-right">{timeAgo(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
