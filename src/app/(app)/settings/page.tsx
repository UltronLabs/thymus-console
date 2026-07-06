import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import ApiKeyManager from "@/components/ApiKeyManager";
import PolicyManager from "@/components/PolicyManager";
import { getWorkingPolicy, hasUnpublishedChanges } from "@/lib/policyStore";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const tenantId = await getTenantId();
  const [keys, policy, versionRows, unpublished] = await Promise.all([
    prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: { id: true, keyPrefix: true, createdAt: true, revokedAt: true },
    }),
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
      <PageHeader title="API keys" subtitle="The SDK sends this as the x-api-key header when ingesting decisions." />
      <div className="px-8 max-w-2xl space-y-4 pb-16">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs text-muted mb-1">Ingest endpoint</div>
          <code className="font-mono text-sm text-foreground">POST /api/decisions</code>
        </div>
        <ApiKeyManager initialKeys={keys} />

        <div className="pt-4">
          <h1 className="text-lg font-medium text-foreground">Trust policy</h1>
          <p className="text-xs text-muted mt-0.5">
            Edit the draft, then Publish to push a new version to every SDK. Agents fetch the live version via{" "}
            <code>GET /api/policy</code>.
          </p>
        </div>
        <PolicyManager initial={policy} versions={versions} hasUnpublished={unpublished} />
      </div>
    </>
  );
}
