import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import LiveDashboard, { type Counts, type RangeKey } from "@/components/LiveDashboard";

export const dynamic = "force-dynamic";

const RANGE_HOURS: Record<RangeKey, number> = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 };

function countsOf(rows: { verdict: string }[]): Counts {
  return {
    total: rows.length,
    quarantine: rows.filter((r) => r.verdict === "quarantine").length,
    tag: rows.filter((r) => r.verdict === "tag").length,
    admit: rows.filter((r) => r.verdict === "admit").length,
  };
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const tenantId = await getTenantId();
  const { range: rawRange } = await searchParams;
  const range: RangeKey = rawRange === "7d" || rawRange === "30d" ? rawRange : "24h";

  const hours = RANGE_HOURS[range];
  const since = new Date(Date.now() - hours * 3600_000);
  const prevSince = new Date(Date.now() - 2 * hours * 3600_000);

  // Current window (full rows for the feed/chart/signals) + previous window
  // (verdicts only, for the stat-card deltas).
  const [rows, prevRows] = await Promise.all([
    prisma.decision.findMany({
      where: { tenantId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { id: true, text: true, channel: true, verdict: true, createdAt: true, taintFlags: true },
    }),
    prisma.decision.findMany({
      where: { tenantId, createdAt: { gte: prevSince, lt: since } },
      select: { verdict: true },
    }),
  ]);

  const initialRows = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));

  return <LiveDashboard initialRows={initialRows} prev={countsOf(prevRows)} range={range} />;
}
