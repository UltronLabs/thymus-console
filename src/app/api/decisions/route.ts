import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { tenantFromRequest } from "@/lib/auth";
import { normalizeDecision, MAX_BATCH } from "@/lib/validate";
import { rateLimit, INGEST_LIMIT, withErrorHandling, parseJson } from "@/lib/apiGuard";

// Ingest decision records from the Thymus SDK's AuditSink. Accepts a single
// record or an array. Snake_case (SDK) and camelCase both accepted.
//
// Returns the created record ids (in input order) so the SDK can optionally
// poll GET /api/decisions/:id/status and block on a human's review decision
// for a quarantined write (the Phase 3 "blocking approval round-trip").
export const POST = withErrorHandling(async (req: Request) => {
  const tenant = await tenantFromRequest(req);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await parseJson(req);
  if (body === undefined) return Response.json({ error: "invalid_json" }, { status: 400 });

  const raw = Array.isArray(body) ? body : [body];
  if (raw.length === 0) return Response.json({ ok: true, count: 0, ids: [] });
  if (raw.length > MAX_BATCH) {
    return Response.json({ error: "batch_too_large", max: MAX_BATCH }, { status: 413 });
  }

  // One batch counts as N records against the key's budget.
  const limited = rateLimit(`ingest:${tenant}`, INGEST_LIMIT, raw.length);
  if (limited) return limited;

  const records = [];
  for (const r of raw) {
    const norm = normalizeDecision(r);
    if (!norm) return Response.json({ error: "invalid_record" }, { status: 400 });
    records.push({ tenantId: tenant, ...norm });
  }

  // createMany doesn't return ids on SQLite, and the SDK needs them in order to
  // poll status — so create per-record but select only the id.
  const ids: string[] = [];
  for (const data of records) {
    const created = await prisma.decision.create({ data, select: { id: true } });
    ids.push(created.id);
  }

  return Response.json({ ok: true, count: ids.length, ids });
});

// List recent decisions (for API consumers; the UI reads Prisma directly).
export const GET = withErrorHandling(async (req: Request) => {
  const tenant = await tenantFromRequest(req as NextRequest);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });
  const rows = await prisma.decision.findMany({
    where: { tenantId: tenant },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return Response.json(rows);
});
