import { tenantFromRequest } from "@/lib/auth";
import { getActiveSnapshot } from "@/lib/policyStore";
import { rateLimit, POLICY_LIMIT, withErrorHandling } from "@/lib/apiGuard";

// The SDK fetches this at startup (thymus.remote.fetch_policy / remote_engine)
// to build a ScreeningEngine reflecting the tenant's *published* policy:
// thresholds, per-tier base trust, floor severity, which detectors run, which
// built-in rules are off, and any custom rules. x-api-key authenticated, same as
// ingest. Draft edits in Settings do NOT appear here until the tenant publishes;
// a tenant that never published gets thymus's own defaults.
export const GET = withErrorHandling(async (req: Request) => {
  const tenant = await tenantFromRequest(req);
  if (!tenant) return Response.json({ error: "unauthorized" }, { status: 401 });

  const limited = rateLimit(`policy:${tenant}`, POLICY_LIMIT);
  if (limited) return limited;

  return Response.json(await getActiveSnapshot(tenant));
});
