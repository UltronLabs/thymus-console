import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import PolicyManager from "@/components/PolicyManager";
import { getWorkingPolicy, hasUnpublishedChanges } from "@/lib/policyStore";

export const dynamic = "force-dynamic";

export default async function Policy() {
  const tenantId = await getTenantId();
  const [policy, versionRows, unpublished] = await Promise.all([
    getWorkingPolicy(tenantId),
    prisma.policyVersion.findMany({
      where: { tenantId },
      orderBy: { version: "desc" },
      select: { version: true, note: true, createdAt: true },
    }),
    hasUnpublishedChanges(tenantId),
  ]);

  const versions = versionRows.map((v) => ({
    version: v.version,
    note: v.note,
    createdAt: v.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Trust policy"
        subtitle="Edit the draft, publish a version, and every SDK picks it up on its next policy fetch."
      />
      <div className="px-8 pb-16 max-w-7xl">
        <PolicyManager initial={policy} versions={versions} hasUnpublished={unpublished} />
      </div>
    </>
  );
}
