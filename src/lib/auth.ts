import { timingSafeEqual } from "node:crypto";
import { prisma } from "./prisma";
import { hashApiKey } from "./apikey";

export const DEFAULT_TENANT = "default";

// Constant-time string compare so the env-key check can't be probed by timing.
// Both sides are hashed to a fixed length first, so length never leaks either.
function safeEqual(a: string, b: string): boolean {
  const ha = hashApiKey(a);
  const hb = hashApiKey(b);
  return timingSafeEqual(Buffer.from(ha), Buffer.from(hb));
}

// Resolves the SDK's x-api-key to a tenant. Real multi-tenancy: per-tenant keys
// created in Settings (hashed, revocable) are the primary path.
//
// The THYMUS_API_KEY env fallback maps to the "default" tenant for local dev and
// the seed demo. It is honored ONLY when THYMUS_API_KEY is explicitly set — there
// is deliberately no hardcoded default key, so a production deploy that forgets to
// set it cannot be authenticated with a guessable value.
export async function tenantFromRequest(req: Request): Promise<string | null> {
  const key = req.headers.get("x-api-key");
  if (!key) return null;

  const hash = hashApiKey(key);
  const record = await prisma.apiKey.findFirst({
    where: { keyHash: hash, revokedAt: null },
    select: { tenantId: true },
  });
  if (record) return record.tenantId;

  const envKey = process.env.THYMUS_API_KEY;
  if (envKey && safeEqual(key, envKey)) return DEFAULT_TENANT;

  return null;
}
