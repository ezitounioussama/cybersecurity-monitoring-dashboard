import type { Prisma } from "@/generated/prisma/client";

export type AlertWithAsset = Prisma.AlertGetPayload<{
  include: {
    destinationAsset: { select: { id: true; hostname: true; ipAddress: true } };
  };
}>;

export type AlertDetail = Prisma.AlertGetPayload<{
  include: {
    destinationAsset: { select: { id: true; hostname: true; ipAddress: true } };
    incidentAlerts: {
      include: {
        incident: { select: { id: true; title: true; status: true } };
      };
    };
  };
}>;
