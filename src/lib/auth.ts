// P0 auth: a single API key maps to a single tenant. Multi-tenant is deferred.
export function tenantFromRequest(req: Request): string | null {
  const key = req.headers.get("x-api-key");
  const expected = process.env.THYMUS_API_KEY ?? "thymus-dev-key";
  if (!key || key !== expected) return null;
  return "default";
}

export const DEFAULT_TENANT = "default";
