import type { Prisma } from "@/generated/prisma/client";

export type AssetRow = Prisma.AssetGetPayload<{
  include: {
    owner: { select: { id: true; name: true; avatarUrl: true } };
    _count: { select: { vulnerabilities: true; alerts: true } };
  };
}>;

export type AssetDetail = Prisma.AssetGetPayload<{
  include: {
    owner: { select: { id: true; name: true; email: true; avatarUrl: true } };
    vulnerabilities: true;
    alerts: true;
  };
}>;

export type AssetOption = { id: string; hostname: string; ipAddress: string };
