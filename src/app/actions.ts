"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { generateApiKey } from "@/lib/apikey";
import { revalidatePath } from "next/cache";

export type ReviewOutcome = "released" | "deleted" | "marked_safe";

// A human resolves a quarantined memory. In the full product this round-trips to
// the waiting SDK and feeds the TrustLedger; here it records the decision.
export async function reviewDecision(id: string, outcome: ReviewOutcome) {
  const tenantId = await getTenantId();
  // Scope the update to the caller's tenant so one tenant can't resolve
  // another's quarantine item by id.
  await prisma.decision.updateMany({
    where: { id, tenantId },
    data: { reviewStatus: outcome, reviewedAt: new Date(), reviewer: "console" },
  });
  revalidatePath("/quarantine");
  revalidatePath("/");
}

// Creates a new ingest key for the caller's tenant. The raw key is returned
// once and never stored — only its hash is persisted.
export async function createApiKey(): Promise<string> {
  const tenantId = await getTenantId();
  const { userId } = await auth();
  const { raw, hash, prefix } = generateApiKey();
  await prisma.apiKey.create({
    data: { tenantId, keyHash: hash, keyPrefix: prefix, createdBy: userId },
  });
  revalidatePath("/settings");
  return raw;
}

export async function revokeApiKey(id: string) {
  const tenantId = await getTenantId();
  await prisma.apiKey.updateMany({
    where: { id, tenantId },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/settings");
}
