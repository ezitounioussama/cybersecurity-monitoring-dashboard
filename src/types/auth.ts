import type { Role } from "@/generated/prisma/enums";

/** The authenticated actor, resolved once per request from Clerk + local DB. */
export type AuthContext = {
  userId: string; // local User.id
  clerkUserId: string;
  organizationId: string;
  role: Role;
  email: string;
  name: string;
  ipAddress: string;
};
