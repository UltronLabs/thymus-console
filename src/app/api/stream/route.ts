import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Server-Sent Events feed of new decisions for the caller's tenant. The
// transport is a genuine push (the client holds one connection open and
// receives events as they happen) even though the server side is implemented
// as a lightweight poll-and-diff loop — there's no separate pub/sub broker to
// run, which matters for a single small Postgres instance on Railway. If this
// ever needs to fan out across multiple server instances, swap the interval
// loop for Postgres LISTEN/NOTIFY without changing the client contract.
export const dynamic = "force-dynamic";

const POLL_MS = 2000;

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) return new Response("unauthorized", { status: 401 });
  const tenantId = orgId ?? userId;

  let closed = false;
  let interval: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      let lastSeen = new Date();
      send("ready", { at: lastSeen.toISOString() });

      const tick = async () => {
        if (closed) return;
        try {
          const rows = await prisma.decision.findMany({
            where: { tenantId, createdAt: { gt: lastSeen } },
            orderBy: { createdAt: "asc" },
          });
          if (rows.length) {
            lastSeen = rows[rows.length - 1].createdAt;
            for (const row of rows) send("decision", row);
          } else {
            send("ping", {});
          }
        } catch {
          // transient DB hiccup — the next tick retries; don't tear down the stream
        }
      };

      interval = setInterval(tick, POLL_MS);
      controller.enqueue(encoder.encode(":ok\n\n")); // open the stream promptly
    },
    cancel() {
      closed = true;
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
