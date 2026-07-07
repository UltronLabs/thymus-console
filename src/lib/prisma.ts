import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

// Dual-provider by DATABASE_URL: SQLite for local dev, Postgres in prod (Railway).
// The container filesystem on Railway is ephemeral, so prod MUST be Postgres — a
// postgres:// URL selects the pg adapter; anything else falls back to a local
// SQLite file. The schema `provider` is aligned to the URL at build time by
// scripts/set-db-provider.mjs (Prisma's provider is static, so it can't be env()).
const raw = process.env.DATABASE_URL ?? "file:./dev.db";
const isPostgres = raw.startsWith("postgres");

function makeAdapter() {
  if (isPostgres) return new PrismaPg({ connectionString: raw });
  // Resolve the SQLite file to an absolute path so it doesn't depend on cwd
  // (which varies across Next's server runtimes).
  const file = raw.replace(/^file:/, "");
  const url = `file:${path.isAbsolute(file) ? file : path.join(process.cwd(), file)}`;
  return new PrismaBetterSqlite3({ url });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: makeAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
