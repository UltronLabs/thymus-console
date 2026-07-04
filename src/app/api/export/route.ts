import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TENANT } from "@/lib/auth";
import { parseFlags } from "@/lib/format";

// ASI06 / EU AI Act Article-12 evidence pack. Every claim traces to specific
// decision record ids. HTML by default; ?format=json for the raw evidence.
export async function GET(req: NextRequest) {
  const tenant = DEFAULT_TENANT;
  const rows = await prisma.decision.findMany({
    where: { tenantId: tenant },
    orderBy: { createdAt: "asc" },
  });

  const quarantined = rows.filter((r) => r.verdict === "quarantine");
  const reviewed = quarantined.filter((r) => r.reviewStatus !== "pending" && r.reviewStatus !== "none");
  const from = rows.at(0)?.createdAt ?? new Date();
  const to = rows.at(-1)?.createdAt ?? new Date();

  if (req.nextUrl.searchParams.get("format") === "json") {
    return Response.json({
      framework: ["OWASP ASI06", "EU AI Act Article 12"],
      tenant,
      period: { from, to },
      totals: {
        screened: rows.length,
        quarantined: quarantined.length,
        tagged: rows.filter((r) => r.verdict === "tag").length,
        reviewed: reviewed.length,
      },
      evidence: quarantined.map((r) => ({
        record_id: r.id,
        at: r.createdAt,
        agent: r.agentId,
        channel: r.channel,
        origin_trust_tier: r.originTrustTier,
        taint_flags: parseFlags(r.taintFlags),
        reason: r.reason,
        review_status: r.reviewStatus,
      })),
      disclaimer: "Compliance aid, not legal certification.",
    });
  }

  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
  const evidenceRows = quarantined
    .map(
      (r) => `<tr>
        <td class="mono">${r.id.slice(0, 10)}…</td>
        <td>${new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 16)}</td>
        <td>${esc(r.agentId ?? "—")}</td>
        <td>${r.originTrustTier}</td>
        <td>${parseFlags(r.taintFlags).join(", ")}</td>
        <td>${r.reviewStatus}</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Thymus — ASI06 / EU AI Act Evidence</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:900px;margin:40px auto;color:#0f172a;padding:0 20px}
  h1{margin-bottom:4px} .sub{color:#64748b;margin-top:0}
  .cards{display:flex;gap:16px;margin:24px 0}
  .card{border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;flex:1}
  .card .n{font-size:28px;font-weight:700} .card .l{color:#64748b;font-size:13px}
  table{border-collapse:collapse;width:100%;font-size:13px} th,td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left}
  th{color:#64748b;font-weight:600} .mono{font-family:ui-monospace,monospace;color:#475569}
  .controls{margin-bottom:16px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px}
  .foot{color:#94a3b8;font-size:12px;margin-top:32px}
</style></head><body>
  <h1>Memory-Poisoning Evidence Pack</h1>
  <p class="sub">OWASP Agentic Top-10 <b>ASI06</b> (Memory &amp; Context Poisoning) · EU AI Act <b>Article 12</b> (record-keeping)</p>
  <p class="sub">Tenant: <b>${tenant}</b> · Period: ${new Date(from).toISOString().slice(0, 10)} → ${new Date(to).toISOString().slice(0, 10)}</p>
  <div class="controls"><b>Control coverage:</b> automatic logging of every memory-write decision (Art. 12 §1);
    tamper-evident, provenance-stamped records; human oversight via the quarantine review queue (Art. 14).</div>
  <div class="cards">
    <div class="card"><div class="n">${rows.length}</div><div class="l">memory writes screened</div></div>
    <div class="card"><div class="n">${quarantined.length}</div><div class="l">poisoning attempts quarantined</div></div>
    <div class="card"><div class="n">${reviewed.length}</div><div class="l">human-reviewed</div></div>
  </div>
  <h3>Detected &amp; contained memory-poisoning attempts</h3>
  <table><thead><tr><th>Record ID</th><th>Timestamp (UTC)</th><th>Agent</th><th>Origin</th><th>Detection flags</th><th>Review</th></tr></thead>
  <tbody>${evidenceRows || `<tr><td colspan="6">No quarantine events in range.</td></tr>`}</tbody></table>
  <p class="foot">Every row above corresponds to a specific decision record retained in the Thymus audit store.
    This report is a <b>compliance aid, not legal certification</b>. Generated ${new Date().toISOString()}.</p>
</body></html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
