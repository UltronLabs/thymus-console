import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { tenantFromRequest, DEFAULT_TENANT } from "@/lib/auth";

// Ingest decision records from the Thymus SDK's AuditSink. Accepts a single
// record or an array. Snake_case (SDK) and camelCase both accepted.
//
// Returns the created record ids (in input order) so the SDK can optionally
// poll GET /api/decisions/:id/status and block on a human's review decision
// for a quarantined write (the Phase 3 "blocking approval round-trip").
export async function POST(req: NextRequest) {
  const tenant = await tenantFromRequest(req);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const records = Array.isArray(body) ? body : [body];

  const ids: string[] = [];
  for (const r of records) {
    const verdict = String(r.verdict ?? "admit");
    const created = await prisma.decision.create({
      data: {
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
      },
      select: { id: true },
    });
    ids.push(created.id);
  }

  return Response.json({ ok: true, count: ids.length, ids });
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
