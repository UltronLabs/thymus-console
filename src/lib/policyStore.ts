import "server-only";
import { prisma } from "@/lib/prisma";
import { compileWorking, DEFAULT_POLICY, type CompiledPolicy } from "@/lib/policy";

// Server-side policy state for a tenant. Two views:
//   - working  = the editable draft (TenantPolicy row + CustomRule rows)
//   - active   = the published PolicyVersion snapshot the SDK actually serves
// Editing changes `working`; publishing freezes `working` into a new version.

export async function getWorkingPolicy(tenantId: string): Promise<CompiledPolicy> {
  const [row, rules] = await Promise.all([
    prisma.tenantPolicy.findUnique({ where: { tenantId } }),
    prisma.customRule.findMany({ where: { tenantId }, orderBy: { createdAt: "asc" } }),
  ]);
  return compileWorking(row, rules);
}

// The snapshot GET /api/policy returns. Null active version → SDK defaults.
export async function getActiveSnapshot(tenantId: string): Promise<CompiledPolicy> {
  const row = await prisma.tenantPolicy.findUnique({
    where: { tenantId },
    select: { activeVersion: true },
  });
  if (!row?.activeVersion) return DEFAULT_POLICY;
  const ver = await prisma.policyVersion.findUnique({
    where: { tenantId_version: { tenantId, version: row.activeVersion } },
  });
  if (!ver) return DEFAULT_POLICY;
  try {
    return JSON.parse(ver.snapshot) as CompiledPolicy;
  } catch {
    return DEFAULT_POLICY;
  }
}

// Ignore the `version` field when comparing draft vs published — it's metadata,
// not policy content.
function contentKey(p: CompiledPolicy): string {
  const { version: _v, ...rest } = p;
  return JSON.stringify(rest);
}

export async function hasUnpublishedChanges(tenantId: string): Promise<boolean> {
  const [working, active] = await Promise.all([getWorkingPolicy(tenantId), getActiveSnapshot(tenantId)]);
  return contentKey(working) !== contentKey(active);
}

// Freeze the current working set into a new immutable version and make it active.
export async function publish(tenantId: string, createdBy: string | null, note = ""): Promise<number> {
  const working = await getWorkingPolicy(tenantId);
  const last = await prisma.policyVersion.findFirst({
    where: { tenantId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (last?.version ?? 0) + 1;
  const snapshot = JSON.stringify({ ...working, version });

  await prisma.policyVersion.create({ data: { tenantId, version, snapshot, note, createdBy } });
  await prisma.tenantPolicy.upsert({
    where: { tenantId },
    create: { tenantId, activeVersion: version },
    update: { activeVersion: version },
  });
  return version;
}

// Restore an old version's content into the working set, then publish it as a new
// version (history is append-only — we never delete or rewrite versions).
export async function rollbackTo(tenantId: string, targetVersion: number, createdBy: string | null): Promise<number> {
  const ver = await prisma.policyVersion.findUnique({
    where: { tenantId_version: { tenantId, version: targetVersion } },
  });
  if (!ver) throw new Error(`version ${targetVersion} not found`);
  const snap = JSON.parse(ver.snapshot) as CompiledPolicy;

  // Overwrite working scalar policy.
  await prisma.tenantPolicy.upsert({
    where: { tenantId },
    create: {
      tenantId,
      quarantineBelow: snap.quarantineBelow,
      tagBelow: snap.tagBelow,
      enabledDetectors: JSON.stringify(snap.enabledDetectors),
      baseTrust: JSON.stringify(snap.baseTrust),
      floorSeverity: snap.floorSeverity,
      disabledRuleIds: JSON.stringify(snap.disabledRuleIds),
    },
    update: {
      quarantineBelow: snap.quarantineBelow,
      tagBelow: snap.tagBelow,
      enabledDetectors: JSON.stringify(snap.enabledDetectors),
      baseTrust: JSON.stringify(snap.baseTrust),
      floorSeverity: snap.floorSeverity,
      disabledRuleIds: JSON.stringify(snap.disabledRuleIds),
    },
  });

  // Replace working custom rules with the snapshot's set.
  await prisma.customRule.deleteMany({ where: { tenantId } });
  if (snap.customRules.length) {
    await prisma.customRule.createMany({
      data: snap.customRules.map((r) => ({
        tenantId,
        ruleId: r.ruleId,
        description: r.description,
        severity: r.severity,
        trustDelta: r.trustDelta,
        flags: JSON.stringify(r.flags),
        allOf: JSON.stringify(r.allOf),
        tags: JSON.stringify(r.tags),
        enabled: r.enabled,
        createdBy,
      })),
    });
  }

  return publish(tenantId, createdBy, `rollback to v${targetVersion}`);
}
