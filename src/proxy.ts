import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// /api/decisions and /api/policy are authenticated by their own x-api-key (the
// SDK), not a Clerk session. /api/webhooks verifies the Svix signature itself.
// All three must be public from Clerk's perspective (no session cookie exists
// for a server-to-server SDK call).
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/decisions(.*)",
  "/api/policy(.*)",
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
