import { prisma } from "@/lib/prisma";
import { DEFAULT_TENANT } from "@/lib/auth";
import { parseFlags, timeAgo } from "@/lib/format";
import { PageHeader, Flags } from "@/components/ui";
import ReviewButtons from "@/components/ReviewButtons";

export const dynamic = "force-dynamic";

export default async function Quarantine() {
  const pending = await prisma.decision.findMany({
    where: { tenantId: DEFAULT_TENANT, verdict: "quarantine", reviewStatus: "pending" },
    orderBy: { createdAt: "desc" },
  });
  const resolved = await prisma.decision.findMany({
    where: { tenantId: DEFAULT_TENANT, verdict: "quarantine", reviewStatus: { in: ["released", "deleted", "marked_safe"] } },
    orderBy: { reviewedAt: "desc" },
    take: 10,
  });

  return (
    <>
      <PageHeader
        title="Quarantine review"
        subtitle={`${pending.length} held ${pending.length === 1 ? "memory" : "memories"} awaiting a human decision`}
      />
      <div className="p-8 space-y-8">
        {pending.length === 0 ? (
          <p className="text-slate-400 text-sm">Nothing in the queue. Blocked poison shows up here for triage.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-100">&ldquo;{r.text}&rdquo;</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {r.agentId} · {r.channel} · origin <span className="text-slate-400">{r.originTrustTier}</span> · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <ReviewButtons id={r.id} />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Flags flags={parseFlags(r.taintFlags)} />
                </div>
                {r.reason && <p className="text-xs text-slate-500 mt-2">{r.reason}</p>}
              </li>
            ))}
          </ul>
        )}

        {resolved.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-400 mb-3">Recently resolved</h2>
            <ul className="divide-y divide-slate-800/70 rounded-xl border border-slate-800 bg-slate-900/40">
              {resolved.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-xs font-medium text-slate-300 w-24">{r.reviewStatus.replace("_", " ")}</span>
                  <span className="flex-1 min-w-0 truncate text-sm text-slate-400">{r.text}</span>
                  <span className="text-xs text-slate-600">{r.reviewedAt ? timeAgo(r.reviewedAt) : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
