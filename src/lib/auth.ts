import { prisma } from "./prisma";
import { hashApiKey } from "./apikey";

export const DEFAULT_TENANT = "default";

// Resolves the SDK's x-api-key to a tenant. Checks per-tenant keys created in
// Settings first (real multi-tenancy); falls back to THYMUS_API_KEY for the
// "default" tenant so local dev / the seed demo keep working without first
// creating a key in the UI.
export async function tenantFromRequest(req: Request): Promise<string | null> {
  const key = req.headers.get("x-api-key");
  if (!key) return null;

  const hash = hashApiKey(key);
  const record = await prisma.apiKey.findFirst({
    where: { keyHash: hash, revokedAt: null },
  });
  if (record) return record.tenantId;

  const fallback = process.env.THYMUS_API_KEY ?? "thymus-dev-key";
  if (key === fallback) return DEFAULT_TENANT;

  return null;
}
