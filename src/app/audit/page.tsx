import { prisma } from "@/lib/prisma";
import { DEFAULT_TENANT } from "@/lib/auth";
import { parseFlags, timeAgo } from "@/lib/format";
import { PageHeader, VerdictBadge, Flags } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Audit() {
  const rows = await prisma.decision.findMany({
    where: { tenantId: DEFAULT_TENANT },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader title="Audit log" subtitle="Every admit / tag / quarantine decision, newest first" />
      <div className="p-8">
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-mutedbg text-muted text-xs">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Verdict</th>
                <th className="text-left font-medium px-4 py-2.5">Memory</th>
                <th className="text-left font-medium px-4 py-2.5">Origin</th>
                <th className="text-left font-medium px-4 py-2.5">Flags</th>
                <th className="text-left font-medium px-4 py-2.5">Trust</th>
                <th className="text-right font-medium px-4 py-2.5">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-mutedbg">
                  <td className="px-4 py-3 align-top"><VerdictBadge verdict={r.verdict} /></td>
                  <td className="px-4 py-3 align-top max-w-md">
                    <div className="truncate text-foreground/80">{r.text}</div>
                    <div className="text-[11px] text-muted/70">{r.agentId} · {r.channel}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-muted">{r.originTrustTier}</td>
                  <td className="px-4 py-3 align-top"><Flags flags={parseFlags(r.taintFlags)} /></td>
                  <td className="px-4 py-3 align-top text-xs text-muted tabular-nums">{r.trustScore.toFixed(2)}</td>
                  <td className="px-4 py-3 align-top text-right text-xs text-muted/70 whitespace-nowrap">{timeAgo(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
