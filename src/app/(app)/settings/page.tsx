import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import ApiKeyManager from "@/components/ApiKeyManager";
import PolicyEditor from "@/components/PolicyEditor";
import { DEFAULT_POLICY, parsePolicyRow } from "@/lib/policy";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const tenantId = await getTenantId();
  const [keys, policyRow] = await Promise.all([
    prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: { id: true, keyPrefix: true, createdAt: true, revokedAt: true },
    }),
    prisma.tenantPolicy.findUnique({ where: { tenantId } }),
  ]);
  const policy = policyRow ? parsePolicyRow(policyRow) : DEFAULT_POLICY;

  return (
    <>
      <PageHeader title="API keys" subtitle="The SDK sends this as the x-api-key header when ingesting decisions." />
      <div className="px-8 max-w-2xl space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs text-muted mb-1">Ingest endpoint</div>
          <code className="font-mono text-sm text-foreground">POST /api/decisions</code>
        </div>
        <ApiKeyManager initialKeys={keys} />
        <PolicyEditor initial={policy} />
      </div>
    </>
  );
}
