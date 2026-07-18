import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Bare Clerk middleware — it only attaches the auth context to each request.
 *
 * Authorization is enforced at the resource level (Clerk's current guidance;
 * `createRouteMatcher` + middleware path-matching is deprecated because it can
 * diverge from Next.js routing and leave resources reachable):
 *   - Dashboard pages → `src/app/(dashboard)/layout.tsx` redirects when signed out.
 *   - API routes → the `apiRoute()` wrapper calls `getAuthContext()` and returns
 *     a 401 envelope for anonymous callers.
 *   - The Clerk webhook stays public and verifies its own Svix signature.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files unless referenced in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|txt|woff|map)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
    // Always run for Clerk's auto-proxy frontend API routes.
    "/__clerk/(.*)",
  ],
};
