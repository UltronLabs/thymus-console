import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import LiveDashboard from "@/components/LiveDashboard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const tenantId = await getTenantId();
  const rows = await prisma.decision.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const initialRows = rows.map((r) => ({
    id: r.id,
    text: r.text,
    channel: r.channel,
    verdict: r.verdict,
    createdAt: r.createdAt.toISOString(),
  }));

  return <LiveDashboard initialRows={initialRows} />;
}
