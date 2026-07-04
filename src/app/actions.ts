"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ReviewOutcome = "released" | "deleted" | "marked_safe";

// A human resolves a quarantined memory. In the full product this round-trips to
// the waiting SDK and feeds the TrustLedger; here it records the decision.
export async function reviewDecision(id: string, outcome: ReviewOutcome) {
  await prisma.decision.update({
    where: { id },
    data: { reviewStatus: outcome, reviewedAt: new Date(), reviewer: "console" },
  });
  revalidatePath("/quarantine");
  revalidatePath("/");
}
