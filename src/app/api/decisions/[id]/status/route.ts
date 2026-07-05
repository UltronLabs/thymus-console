import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { tenantFromRequest } from "@/lib/auth";

// The SDK polls this to learn whether a quarantined write has been resolved
// by a human in the console (release / delete / mark_safe). x-api-key
// authenticated, same as the ingest endpoint, and tenant-scoped so one
// tenant can never probe another's decision by id.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenant = await tenantFromRequest(req);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const row = await prisma.decision.findFirst({
    where: { id, tenantId: tenant },
    select: { verdict: true, reviewStatus: true },
  });
  if (!row) return Response.json({ error: "not found" }, { status: 404 });

  return Response.json(row);
}
