import "server-only";

// Lightweight in-process rate limiter + error hygiene for the public API routes
// (/api/decisions, /api/policy). These are x-api-key authenticated and reachable
// by any SDK, so an abused or leaked key shouldn't be able to flood the DB.
//
// SINGLE-INSTANCE ONLY: the counter lives in module memory, which is correct for
// one Railway service instance. When scaling horizontally, swap _hits for a
// shared store (Upstash/Redis) — the call sites don't change.

type Window = { count: number; resetAt: number };
const _hits = new Map<string, Window>();

export type RateLimit = { limit: number; windowMs: number };
export const INGEST_LIMIT: RateLimit = { limit: 600, windowMs: 60_000 }; // 600 records/min/key
export const POLICY_LIMIT: RateLimit = { limit: 120, windowMs: 60_000 };

// Returns null if allowed, or a 429 Response if the key is over budget.
// `cost` lets a batch ingest count as N against the budget.
export function rateLimit(key: string, cfg: RateLimit, cost = 1): Response | null {
  const now = Date.now();
  const w = _hits.get(key);
  if (!w || now >= w.resetAt) {
    _hits.set(key, { count: cost, resetAt: now + cfg.windowMs });
    return null;
  }
  if (w.count + cost > cfg.limit) {
    const retry = Math.ceil((w.resetAt - now) / 1000);
    return Response.json(
      { error: "rate_limited", retryAfterSeconds: retry },
      { status: 429, headers: { "Retry-After": String(retry) } },
    );
  }
  w.count += cost;
  return null;
}

// Opportunistic cleanup so the map can't grow unbounded across many keys.
export function sweepRateLimiter(now = Date.now()): void {
  if (_hits.size < 10_000) return;
  for (const [k, w] of _hits) if (now >= w.resetAt) _hits.delete(k);
}

// Wraps a route handler so a thrown error becomes a clean JSON 500 without
// leaking a stack trace to the client. Real details go to the server log only.
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req) => {
    try {
      return await handler(req);
    } catch (err) {
      console.error(`[api] ${req.method} ${new URL(req.url).pathname} failed:`, err);
      return Response.json({ error: "internal_error" }, { status: 500 });
    }
  };
}

// A safe JSON body parse: returns undefined on malformed/oversized bodies instead
// of throwing, so handlers can return a clean 400.
export async function parseJson(req: Request): Promise<unknown | undefined> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}
