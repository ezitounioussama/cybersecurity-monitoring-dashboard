import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Promote a real (non-seed) user to ADMIN.
 *
 *   pnpm db:make-admin                 → promotes the most recently created real user
 *   pnpm db:make-admin you@email.com   → promotes the user with that email
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const email = process.argv[2];

  const target = email
    ? await prisma.user.findFirst({ where: { email, deletedAt: null } })
    : await prisma.user.findFirst({
        where: { deletedAt: null, NOT: { clerkUserId: { startsWith: "seed_" } } },
        orderBy: { createdAt: "desc" },
      });

  if (!target) {
    console.error(
      email
        ? `No user found with email ${email}. Sign in to the app first, then re-run.`
        : "No real (non-seed) user found yet. Sign in to the app once, then re-run.",
    );
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { role: "ADMIN", isActive: true },
  });
  console.log(`✓ Promoted ${updated.email} (${updated.name}) to ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
