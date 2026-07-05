import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { tenantFromRequest } from "@/lib/auth";
import { DEFAULT_POLICY, parsePolicyRow } from "@/lib/policy";

// The SDK fetches this at startup (thymus.remote.fetch_policy) to build a
// ScreeningEngine reflecting whatever a tenant tuned in Settings: quarantine/
// tag thresholds and which built-in detectors run. x-api-key authenticated,
// same as ingest. A tenant with no saved policy gets thymus's own defaults.
export async function GET(req: NextRequest) {
  const tenant = await tenantFromRequest(req);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });

  const row = await prisma.tenantPolicy.findUnique({ where: { tenantId: tenant } });
  return Response.json(row ? parsePolicyRow(row) : DEFAULT_POLICY);
}
