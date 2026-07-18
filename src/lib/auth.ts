import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { cache } from "react";
import { UnauthorizedError } from "@/lib/errors";
import { userService } from "@/services/user.service";
import type { AuthContext } from "@/types/auth";

async function resolveIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}

/**
 * Request-scoped authenticated context. Memoized per request so provisioning
 * and DB lookups run once. Throws UnauthorizedError when signed out.
 */
export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const { userId, orgId, orgRole } = await auth();
  if (!userId) throw new UnauthorizedError();

  const clerkUser = await currentUser();
  if (!clerkUser) throw new UnauthorizedError();

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "unknown@example.com";
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email;

  const { user, organization } = await userService.getOrProvisionCurrent({
    clerkUserId: userId,
    email,
    name,
    avatarUrl: clerkUser.imageUrl,
    clerkOrgId: orgId,
    role: orgRole ?? (clerkUser.publicMetadata?.role as string | undefined),
  });

  return {
    userId: user.id,
    clerkUserId: userId,
    organizationId: organization.id,
    role: user.role,
    email: user.email,
    name: user.name,
    ipAddress: await resolveIp(),
  };
});

export async function getAuthContextOrNull(): Promise<AuthContext | null> {
  try {
    return await getAuthContext();
  } catch {
    return null;
  }
}
