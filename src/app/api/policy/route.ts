import type { NextRequest } from "next/server";
import { tenantFromRequest } from "@/lib/auth";
import { getActiveSnapshot } from "@/lib/policyStore";

// The SDK fetches this at startup (thymus.remote.fetch_policy / remote_engine)
// to build a ScreeningEngine reflecting the tenant's *published* policy:
// thresholds, per-tier base trust, floor severity, which detectors run, which
// built-in rules are off, and any custom rules. x-api-key authenticated, same as
// ingest. Draft edits in Settings do NOT appear here until the tenant publishes;
// a tenant that never published gets thymus's own defaults.
export async function GET(req: NextRequest) {
  const tenant = await tenantFromRequest(req);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });

  return Response.json(await getActiveSnapshot(tenant));
}
