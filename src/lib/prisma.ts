import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 requires a driver adapter. SQLite for local/dev; swap the adapter +
// DATABASE_URL for Postgres in prod (Railway) — the schema and queries are the same.
// Resolve the SQLite file to an absolute path so it doesn't depend on the process
// cwd (which can vary across Next's server runtimes).
const raw = process.env.DATABASE_URL ?? "file:./dev.db";
const file = raw.replace(/^file:/, "");
const url = file.startsWith("postgres")
  ? raw
  : `file:${path.isAbsolute(file) ? file : path.join(process.cwd(), file)}`;

const adapter = new PrismaBetterSqlite3({ url });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
