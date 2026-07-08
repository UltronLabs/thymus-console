import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Postgres everywhere — local dev and prod (Railway) both point DATABASE_URL at
// a real Postgres instance. No SQLite fallback: Railway's container filesystem
// is ephemeral, so a file-based DB can't work in prod, and keeping one DB engine
// in both places avoids local/prod behavioral drift.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
