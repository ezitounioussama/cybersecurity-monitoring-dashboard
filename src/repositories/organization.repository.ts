import { prisma } from "@/lib/prisma";

/** The only layer permitted to touch the Prisma client (agent.md §3). */
export const organizationRepository = {
  findByClerkOrgId(clerkOrgId: string) {
    return prisma.organization.findUnique({ where: { clerkOrgId } });
  },

  findById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
  },

  upsertByClerkOrgId(data: {
    clerkOrgId: string;
    name: string;
    slug: string;
    plan?: string;
  }) {
    return prisma.organization.upsert({
      where: { clerkOrgId: data.clerkOrgId },
      update: { name: data.name, slug: data.slug },
      create: {
        clerkOrgId: data.clerkOrgId,
        name: data.name,
        slug: data.slug,
        plan: data.plan ?? "free",
      },
    });
  },
};
