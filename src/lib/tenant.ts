import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// The tenant a signed-in request acts as: the active Clerk organization if one
// is selected, otherwise the personal Clerk user id. Both are opaque Clerk ids
// (`org_...` / `user_...`) and both work identically as `Decision.tenantId`.
export async function getTenantId(): Promise<string> {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  return orgId ?? userId;
}
