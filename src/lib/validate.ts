// Ingest validation for POST /api/decisions. This endpoint is public (x-api-key,
// no Clerk session) and fed by SDKs we don't control the version of, so it must
// treat every field as hostile: clamp enums to known values, cap sizes, and
// coerce numbers safely rather than trusting the payload shape.

export const MAX_BATCH = 200; // records per request
export const MAX_TEXT = 16_000; // chars of memory text stored
export const MAX_FLAGS = 32; // taint flags per record
export const MAX_FLAG_LEN = 64; // chars per flag

const CHANNELS = new Set(["user_chat", "tool_output", "web", "rag_doc", "system", "agent", "unknown"]);
const TIERS = new Set(["trusted", "standard", "untrusted", "hostile"]);
const VERDICTS = new Set(["admit", "tag", "quarantine"]);
const SEVERITIES = new Set(["none", "low", "medium", "high", "critical"]);

function pick(v: unknown, allowed: Set<string>, fallback: string): string {
  return typeof v === "string" && allowed.has(v) ? v : fallback;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  return v.length > max ? v.slice(0, max) : v;
}

function num01(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function flags(v: unknown): string {
  const arr = Array.isArray(v) ? v : [];
  const clean = arr
    .filter((f) => typeof f === "string")
    .slice(0, MAX_FLAGS)
    .map((f) => (f as string).slice(0, MAX_FLAG_LEN));
  return JSON.stringify(clean);
}

export type NormalizedDecision = {
  agentId: string | null;
  sessionId: string | null;
  actorId: string | null;
  channel: string;
  originTrustTier: string;
  text: string | null;
  contentHash: string | null;
  verdict: string;
  trustScore: number;
  severity: string;
  taintFlags: string;
  reason: string | null;
  decidingPolicy: string | null;
  reviewStatus: string;
};

// snake_case (SDK) and camelCase both accepted. Returns null for a non-object
// record so the caller can reject the whole batch with a clear error.
export function normalizeDecision(r: unknown): NormalizedDecision | null {
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  const o = r as Record<string, unknown>;
  const verdict = pick(o.verdict, VERDICTS, "admit");
  return {
    agentId: str(o.agentId ?? o.agent_id, 200),
    sessionId: str(o.sessionId ?? o.session_id, 200),
    actorId: str(o.actorId ?? o.actor_id, 200),
    channel: pick(o.channel, CHANNELS, "unknown"),
    originTrustTier: pick(o.originTrustTier ?? o.origin_trust_tier, TIERS, "standard"),
    text: str(o.text, MAX_TEXT),
    contentHash: str(o.contentHash ?? o.content_hash, 200),
    verdict,
    trustScore: num01(o.trustScore ?? o.trust_score),
    severity: pick(o.severity, SEVERITIES, "none"),
    taintFlags: flags(o.taintFlags ?? o.taint_flags),
    reason: str(o.reason, 2000),
    decidingPolicy: str(o.decidingPolicy ?? o.deciding_policy, 200),
    reviewStatus: verdict === "quarantine" ? "pending" : "none",
  };
}
