import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Syncs Clerk user/org lifecycle events into our own tables. This is a local
// mirror for display/joins — Clerk remains the source of truth for auth itself.
// Always returns 200 quickly; Svix retries on non-2xx.
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("clerk webhook verification failed:", err);
    return new Response("verification failed", { status: 400 });
  }

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      await prisma.user.upsert({
        where: { id },
        create: {
          id,
          email: email_addresses?.[0]?.email_address ?? null,
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          imageUrl: image_url ?? null,
        },
        update: {
          email: email_addresses?.[0]?.email_address ?? null,
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          imageUrl: image_url ?? null,
        },
      });
      break;
    }
    case "user.deleted": {
      const { id } = evt.data;
      if (id) await prisma.user.deleteMany({ where: { id } });
      break;
    }
    case "organization.created":
    case "organization.updated": {
      const { id, name, slug } = evt.data;
      await prisma.organization.upsert({
        where: { id },
        create: { id, name, slug: slug ?? null },
        update: { name, slug: slug ?? null },
      });
      break;
    }
    case "organization.deleted": {
      const { id } = evt.data;
      if (id) await prisma.organization.deleteMany({ where: { id } });
      break;
    }
    default:
      break; // memberships/invitations: not needed for single-tenant-per-org model yet
  }

  return new Response("ok", { status: 200 });
}
