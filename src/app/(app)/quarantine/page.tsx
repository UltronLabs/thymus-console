import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import LiveQuarantine from "@/components/LiveQuarantine";

export const dynamic = "force-dynamic";

export default async function Quarantine() {
  const tenantId = await getTenantId();
  const pending = await prisma.decision.findMany({
    where: { tenantId, verdict: "quarantine", reviewStatus: "pending" },
    orderBy: { createdAt: "desc" },
  });
  const resolved = await prisma.decision.findMany({
    where: { tenantId, verdict: "quarantine", reviewStatus: { in: ["released", "deleted", "marked_safe"] } },
    orderBy: { reviewedAt: "desc" },
    take: 10,
  });

  return (
    <LiveQuarantine
      initialPending={pending.map((r) => ({
        id: r.id,
        text: r.text,
        agentId: r.agentId,
        channel: r.channel,
        originTrustTier: r.originTrustTier,
        taintFlags: r.taintFlags,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
      }))}
      resolved={resolved.map((r) => ({
        id: r.id,
        text: r.text,
        reviewStatus: r.reviewStatus,
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
      }))}
    />
  );
}
