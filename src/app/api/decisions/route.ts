import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { tenantFromRequest, DEFAULT_TENANT } from "@/lib/auth";

// Ingest decision records from the Thymus SDK's AuditSink. Accepts a single
// record or an array. Snake_case (SDK) and camelCase both accepted.
export async function POST(req: NextRequest) {
  const tenant = await tenantFromRequest(req);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const records = Array.isArray(body) ? body : [body];

  const data = records.map((r) => {
    const verdict = String(r.verdict ?? "admit");
    return {
      tenantId: tenant,
      agentId: r.agentId ?? r.agent_id ?? null,
      sessionId: r.sessionId ?? r.session_id ?? null,
      actorId: r.actorId ?? r.actor_id ?? null,
      channel: r.channel ?? "unknown",
      originTrustTier: r.originTrustTier ?? r.origin_trust_tier ?? "standard",
      text: r.text ?? null,
      contentHash: r.contentHash ?? r.content_hash ?? null,
      verdict,
      trustScore: Number(r.trustScore ?? r.trust_score ?? 0),
      severity: r.severity ?? "none",
      taintFlags: JSON.stringify(r.taintFlags ?? r.taint_flags ?? []),
      reason: r.reason ?? null,
      decidingPolicy: r.decidingPolicy ?? r.deciding_policy ?? null,
      reviewStatus: verdict === "quarantine" ? "pending" : "none",
    };
  });

  const res = await prisma.decision.createMany({ data });
  return Response.json({ ok: true, count: res.count });
}

// List recent decisions (for API consumers; the UI reads Prisma directly).
export async function GET(req: NextRequest) {
  const tenant = await tenantFromRequest(req);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });
  const rows = await prisma.decision.findMany({
    where: { tenantId: tenant ?? DEFAULT_TENANT },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return Response.json(rows);
}
