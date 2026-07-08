// Align the Prisma datasource provider to DATABASE_URL before generate / db push.
//
// We run SQLite locally and Postgres in prod (Railway), switched by DATABASE_URL.
// Prisma's datasource `provider` is a static string — it can't be env()-driven —
// so this script rewrites it to match the target DB at build/dev time:
//   postgres://...  -> provider = "postgresql"
//   file:... / unset -> provider = "sqlite"
//
// The runtime adapter is chosen the same way in src/lib/prisma.ts. Table creation
// is done with `prisma db push` (not migration files), which avoids Prisma's
// per-provider migration lock while we're pre-launch with no production data.
import { readFileSync, writeFileSync } from "node:fs";
import "dotenv/config"; // read .env for local dev; no-op in prod (Railway sets DATABASE_URL directly)

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const provider = url.startsWith("postgres") ? "postgresql" : "sqlite";

const schemaPath = "prisma/schema.prisma";
const src = readFileSync(schemaPath, "utf8");
// Only the datasource provider is sqlite|postgresql; the generator provider is
// "prisma-client-js" and won't match this pattern.
const next = src.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${provider}"`);

if (next !== src) {
  writeFileSync(schemaPath, next);
  console.log(`[db] schema provider set to "${provider}"`);
} else {
  console.log(`[db] schema provider already "${provider}"`);
}
