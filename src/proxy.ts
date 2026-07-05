import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// /api/decisions is authenticated by its own x-api-key (the SDK's HttpAuditSink),
// not a Clerk session. /api/webhooks verifies the Svix signature itself. Both
// must be public from Clerk's perspective (no session cookie exists for them).
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/decisions(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
