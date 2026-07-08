// End-to-end smoke + tenant-isolation test for the hardened public API.
// Provisions throwaway tenants directly in the dev DB, exercises every path
// against the running console, asserts, and cleans up after itself.
//
//   node scripts/smoke.mjs            (console must be running on :3000)
//
// Not a unit test — it needs the live server — so it lives in scripts/, not the
// Vitest/pytest suites. Exit code is nonzero on any failed assertion.

import "dotenv/config";
import { createHash, randomBytes } from "node:crypto";

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

// Dual-provider, mirroring src/lib/prisma.ts: SQLite locally, Postgres in prod.
// The smoke test seeds ApiKey rows directly (bypassing the app) so it can test
// auth without a signed-in browser session.
const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const isPostgres = dbUrl.startsWith("postgres");

let insertKeyRow, deleteTenantRows, closeDb;
if (isPostgres) {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  insertKeyRow = (id, tenantId, keyHash, keyPrefix) =>
    client.query(
      'INSERT INTO "ApiKey" (id, "tenantId", "keyHash", "keyPrefix", "createdAt") VALUES ($1, $2, $3, $4, now())',
      [id, tenantId, keyHash, keyPrefix],
    );
  deleteTenantRows = async (t) => {
    for (const table of ["Decision", "ApiKey", "TenantPolicy", "PolicyVersion", "CustomRule"]) {
      await client.query(`DELETE FROM "${table}" WHERE "tenantId" = $1`, [t]);
    }
  };
  closeDb = () => client.end();
} else {
  const { default: Database } = await import("better-sqlite3");
  const db = new Database(dbUrl.replace(/^file:/, ""));
  insertKeyRow = (id, tenantId, keyHash, keyPrefix) =>
    db
      .prepare("INSERT INTO ApiKey (id, tenantId, keyHash, keyPrefix, createdAt) VALUES (?, ?, ?, ?, datetime('now'))")
      .run(id, tenantId, keyHash, keyPrefix);
  deleteTenantRows = (t) => {
    for (const table of ["Decision", "ApiKey", "TenantPolicy", "PolicyVersion", "CustomRule"]) {
      db.prepare(`DELETE FROM ${table} WHERE tenantId = ?`).run(t);
    }
  };
  closeDb = () => db.close();
}

let pass = 0;
const failures = [];
function ok(cond, label) {
  if (cond) { pass++; console.log(`  ok   ${label}`); }
  else { failures.push(label); console.log(`  FAIL ${label}`); }
}

// --- provision throwaway tenants + keys ------------------------------------
const tenants = ["smoke_A", "smoke_B", "smoke_C"];
const keys = {};
async function cleanup() {
  for (const t of tenants) await deleteTenantRows(t);
}
await cleanup(); // in case a prior run aborted
for (const t of tenants) {
  const raw = "thym_" + randomBytes(24).toString("base64url");
  keys[t] = raw;
  await insertKeyRow(`smokekey_${t}`, t, sha256(raw), raw.slice(0, 12));
}

const H = (t) => ({ "content-type": "application/json", "x-api-key": keys[t] });
const post = (t, body) => fetch(`${BASE}/api/decisions`, { method: "POST", headers: H(t), body: JSON.stringify(body) });
const list = (t) => fetch(`${BASE}/api/decisions`, { headers: H(t) });

try {
  // --- 1. ingest + list round-trip -----------------------------------------
  const ingestA = await post("smoke_A", [
    { text: "benign A note", channel: "user_chat", verdict: "admit", trust_score: 0.9 },
    { text: "poison A", channel: "user_chat", verdict: "quarantine", trust_score: 0.0, severity: "critical" },
  ]);
  const bodyA = await ingestA.json();
  ok(ingestA.status === 200 && bodyA.count === 2 && bodyA.ids.length === 2, "ingest returns 200 + 2 ids");
  const quarId = bodyA.ids[1];

  const listA = await (await list("smoke_A")).json();
  ok(Array.isArray(listA) && listA.length === 2, "tenant A lists its own 2 records");

  // --- 2. tenant isolation --------------------------------------------------
  const listB = await (await list("smoke_B")).json();
  ok(Array.isArray(listB) && listB.length === 0, "tenant B sees NONE of tenant A's records");

  const statusOwn = await fetch(`${BASE}/api/decisions/${quarId}/status`, { headers: H("smoke_A") });
  ok(statusOwn.status === 200, "tenant A reads its own decision status (200)");

  const statusCross = await fetch(`${BASE}/api/decisions/${quarId}/status`, { headers: H("smoke_B") });
  ok(statusCross.status === 404, "tenant B is 404 on tenant A's decision id (no cross-tenant probe)");

  // --- 3. auth ------------------------------------------------------------
  const noKey = await fetch(`${BASE}/api/decisions`, { method: "POST", body: "[]" });
  ok(noKey.status === 401, "missing x-api-key -> 401");
  const badKey = await fetch(`${BASE}/api/decisions`, { headers: { "x-api-key": "thym_not_a_real_key" } });
  ok(badKey.status === 401, "unknown x-api-key -> 401");

  // --- 4. input validation --------------------------------------------------
  const badJson = await fetch(`${BASE}/api/decisions`, { method: "POST", headers: H("smoke_A"), body: "{not json" });
  ok(badJson.status === 400, "malformed JSON body -> 400");

  const tooBig = await post("smoke_A", Array.from({ length: 201 }, () => ({ text: "x" })));
  ok(tooBig.status === 413, "batch > 200 -> 413");

  // enum clamping + size cap
  await post("smoke_C", [{
    text: "y".repeat(20000), channel: "evilchannel", origin_trust_tier: "pwned",
    verdict: "HACKED", severity: "ULTRA", trust_score: 999, taint_flags: "notanarray",
  }]);
  const clamped = (await (await list("smoke_C")).json())[0];
  ok(clamped.verdict === "admit", "unknown verdict clamped to 'admit'");
  ok(clamped.severity === "none", "unknown severity clamped to 'none'");
  ok(clamped.originTrustTier === "standard", "unknown tier clamped to 'standard'");
  ok(clamped.channel === "unknown", "unknown channel clamped to 'unknown'");
  ok(clamped.trustScore >= 0 && clamped.trustScore <= 1, "out-of-range trustScore clamped to [0,1]");
  ok((clamped.text?.length ?? 0) <= 16000, "oversized text truncated to 16k");
  ok(clamped.taintFlags === "[]", "non-array taint_flags coerced to []");

  // --- 5. policy endpoint isolation + defaults ------------------------------
  const polA = await fetch(`${BASE}/api/policy`, { headers: H("smoke_A") });
  const polBody = await polA.json();
  ok(polA.status === 200 && polBody.quarantineBelow === 0.45, "unpublished tenant gets default policy");

  // --- 6. rate limiting -----------------------------------------------------
  // INGEST_LIMIT is 600/min; smoke_C already spent 1. Push past 600 with batches.
  let got429 = false;
  for (let i = 0; i < 5 && !got429; i++) {
    const r = await post("smoke_C", Array.from({ length: 200 }, () => ({ text: "rl", verdict: "admit" })));
    if (r.status === 429) got429 = true;
  }
  ok(got429, "ingest over 600 records/min -> 429");
} finally {
  await cleanup();
  await closeDb();
}

console.log(`\n${pass} passed, ${failures.length} failed`);
if (failures.length) { console.error("FAILURES:\n - " + failures.join("\n - ")); process.exit(1); }
console.log("smoke + isolation: ALL GREEN");
