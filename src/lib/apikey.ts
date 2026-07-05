import { randomBytes, createHash } from "node:crypto";

const PREFIX = "thym_";

// The raw key is shown to the user exactly once, at creation time. We store
// only its hash — the DB can verify a presented key but never reveal it back.
export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = PREFIX + randomBytes(24).toString("base64url");
  return { raw, hash: hashApiKey(raw), prefix: raw.slice(0, 12) };
}

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
