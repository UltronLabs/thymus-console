"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { generateApiKey } from "@/lib/apikey";
import type { DetectorName } from "@/lib/policy";
import type { Severity, Tier } from "@/lib/ruleMatch";
import { publish as publishPolicy, rollbackTo } from "@/lib/policyStore";
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

// ---- Policy editing (working draft — not live until published) --------------

export type PolicyKnobsInput = {
  quarantineBelow: number;
  tagBelow: number;
  enabledDetectors: DetectorName[];
  baseTrust: Record<Tier, number>;
  floorSeverity: Severity;
  disabledRuleIds: string[];
};

// Saves the scalar policy knobs to the working draft. Call publishPolicyVersion()
// to push the draft to SDKs.
export async function savePolicyKnobs(input: PolicyKnobsInput) {
  const tenantId = await getTenantId();
  const data = {
    quarantineBelow: input.quarantineBelow,
    tagBelow: input.tagBelow,
    enabledDetectors: JSON.stringify(input.enabledDetectors),
    baseTrust: JSON.stringify(input.baseTrust),
    floorSeverity: input.floorSeverity,
    disabledRuleIds: JSON.stringify(input.disabledRuleIds),
  };
  await prisma.tenantPolicy.upsert({ where: { tenantId }, create: { tenantId, ...data }, update: data });
  revalidatePath("/settings");
}

export type CustomRuleInput = {
  ruleId: string;
  description: string;
  severity: Severity;
  trustDelta: number;
  flags: string[];
  allOf: string[][];
  tags: string[];
  enabled: boolean;
};

export async function upsertCustomRule(input: CustomRuleInput) {
  const tenantId = await getTenantId();
  const { userId } = await auth();
  const slug = input.ruleId.trim();
  if (!slug) throw new Error("rule id is required");
  // Keep custom ids namespaced so they can never collide with a built-in id.
  const ruleId = slug.startsWith("custom.") ? slug : `custom.${slug}`;
  const data = {
    description: input.description,
    severity: input.severity,
    trustDelta: input.trustDelta,
    flags: JSON.stringify(input.flags),
    allOf: JSON.stringify(input.allOf.filter((g) => g.length)),
    tags: JSON.stringify(input.tags),
    enabled: input.enabled,
  };
  await prisma.customRule.upsert({
    where: { tenantId_ruleId: { tenantId, ruleId } },
    create: { tenantId, ruleId, createdBy: userId, ...data },
    update: data,
  });
  revalidatePath("/settings");
}

export async function deleteCustomRule(ruleId: string) {
  const tenantId = await getTenantId();
  await prisma.customRule.deleteMany({ where: { tenantId, ruleId } });
  revalidatePath("/settings");
}

// Freezes the current draft into a new immutable version and makes it live.
export async function publishPolicyVersion(note = "") {
  const tenantId = await getTenantId();
  const { userId } = await auth();
  const version = await publishPolicy(tenantId, userId, note);
  revalidatePath("/settings");
  return version;
}

// Restores an old version into the draft and re-publishes it (append-only).
export async function rollbackPolicy(targetVersion: number) {
  const tenantId = await getTenantId();
  const { userId } = await auth();
  const version = await rollbackTo(tenantId, targetVersion, userId);
  revalidatePath("/settings");
  return version;
}
