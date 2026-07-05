import { prisma } from "@/lib/prisma";
import { DEFAULT_TENANT } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { FileText, FileJson, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Evidence() {
  const rows = await prisma.decision.findMany({ where: { tenantId: DEFAULT_TENANT } });
  const quarantined = rows.filter((r) => r.verdict === "quarantine").length;
  const reviewed = rows.filter((r) => r.verdict === "quarantine" && !["pending", "none"].includes(r.reviewStatus)).length;

  return (
    <>
      <PageHeader title="Compliance evidence" subtitle="OWASP ASI06 · EU AI Act Article 12 (record-keeping)" />
      <div className="p-8 max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-foreground/80 leading-relaxed">
            Thymus retains a provenance-stamped record of every memory-write decision. This export maps those records to
            <b className="text-foreground"> OWASP ASI06</b> (Memory &amp; Context Poisoning) and
            <b className="text-foreground"> EU AI Act Article 12</b> (automatic logging &amp; traceability). Every claim in the
            report traces to a specific decision record id.
          </p>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div><div className="text-2xl font-semibold text-foreground">{rows.length}</div><div className="text-xs text-muted">writes screened</div></div>
            <div><div className="text-2xl font-semibold text-rose-600 dark:text-rose-300">{quarantined}</div><div className="text-xs text-muted">poisoning attempts logged</div></div>
            <div><div className="text-2xl font-semibold text-sky-600 dark:text-sky-300">{reviewed}</div><div className="text-xs text-muted">human-reviewed</div></div>
          </div>
          <div className="flex gap-3">
            <a href="/api/export" target="_blank" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-400">
              <FileText className="size-4" /> Open evidence pack <ExternalLink className="size-3.5" />
            </a>
            <a href="/api/export?format=json" target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground/80 hover:bg-mutedbg">
              <FileJson className="size-4" /> JSON
            </a>
          </div>
        </div>
        <p className="text-xs text-muted">This report is a compliance aid, not legal certification.</p>
      </div>
    </>
  );
}
