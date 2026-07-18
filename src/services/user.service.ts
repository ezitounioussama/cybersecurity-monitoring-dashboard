import type { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import { DEFAULT_ORG } from "@/lib/constants";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { organizationRepository } from "@/repositories/organization.repository";
import { userRepository } from "@/repositories/user.repository";
import { auditService } from "@/services/audit.service";
import { assertCan } from "@/services/authorization.service";
import type { ListParams } from "@/types/api";
import type { AuthContext } from "@/types/auth";

function normalizeRole(raw?: string | null): Role | undefined {
  if (!raw) return undefined;
  const value = raw
    .toUpperCase()
    .replace(/^ORG:/, "")
    .replace("BASIC_MEMBER", "VIEWER");
  if (value === "ADMIN") return "ADMIN";
  if (value === "ANALYST") return "ANALYST";
  if (value === "VIEWER" || value === "MEMBER") return "VIEWER";
  return undefined;
}

type ProvisionInput = {
  clerkUserId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  clerkOrgId?: string | null;
  clerkOrgName?: string | null;
  role?: string | null;
};

export const userService = {
  /** Resolve the local User for the signed-in Clerk identity, creating it on first sight. */
  async getOrProvisionCurrent(input: ProvisionInput) {
    const existing = await userRepository.findByClerkUserId(input.clerkUserId);
    if (existing) {
      const organization = await organizationRepository.findById(
        existing.organizationId,
      );
      if (!organization) throw new NotFoundError("Organization not found");
      return { user: existing, organization };
    }

    const organization = input.clerkOrgId
      ? await organizationRepository.upsertByClerkOrgId({
          clerkOrgId: input.clerkOrgId,
          name: input.clerkOrgName ?? DEFAULT_ORG.name,
          slug: input.clerkOrgId,
        })
      : await organizationRepository.upsertByClerkOrgId({ ...DEFAULT_ORG });

    const memberCount = await userRepository.countByOrganization(
      organization.id,
    );
    const role =
      normalizeRole(input.role) ?? (memberCount === 0 ? "ADMIN" : "VIEWER");

    const user = await userRepository.create({
      clerkUserId: input.clerkUserId,
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl ?? undefined,
      role,
      organization: { connect: { id: organization.id } },
    });

    return { user, organization };
  },

  /** Webhook-driven upsert (keeps local mirror in sync with Clerk). */
  async syncFromWebhook(input: ProvisionInput) {
    const existing = await userRepository.findByClerkUserId(input.clerkUserId);
    if (existing) {
      return userRepository.update(existing.id, {
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl ?? undefined,
      });
    }
    const { user } = await this.getOrProvisionCurrent(input);
    return user;
  },

  async deactivateByClerkUserId(clerkUserId: string) {
    const existing = await userRepository.findByClerkUserId(clerkUserId);
    if (existing) await userRepository.softDelete(existing.id);
  },

  async list(ctx: AuthContext, params: ListParams & { role?: Role }) {
    assertCan(ctx.role, "user:manage");
    const { page, pageSize } = params;
    const { items, total } = await userRepository.list({
      organizationId: ctx.organizationId,
      search: params.search,
      role: params.role,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: params.sortBy
        ? ({
            [params.sortBy]: params.sortDir ?? "asc",
          } as Prisma.UserOrderByWithRelationInput)
        : undefined,
    });
    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async updateRole(ctx: AuthContext, userId: string, role: Role) {
    assertCan(ctx.role, "user:manage");
    const target = await userRepository.findById(userId);
    if (!target || target.organizationId !== ctx.organizationId) {
      throw new NotFoundError("User not found");
    }
    const updated = await userRepository.update(userId, { role });
    await auditService.record(ctx, {
      action: "ROLE_CHANGE",
      entityType: "User",
      entityId: userId,
      metadata: { from: target.role, to: role },
    });
    return updated;
  },

  async setActive(ctx: AuthContext, userId: string, isActive: boolean) {
    assertCan(ctx.role, "user:manage");
    const target = await userRepository.findById(userId);
    if (!target || target.organizationId !== ctx.organizationId) {
      throw new NotFoundError("User not found");
    }
    if (target.id === ctx.userId && !isActive) {
      throw new ForbiddenError("You cannot deactivate your own account");
    }
    const updated = await userRepository.update(userId, { isActive });
    await auditService.record(ctx, {
      action: "UPDATE",
      entityType: "User",
      entityId: userId,
      metadata: { isActive },
    });
    return updated;
  },
};
