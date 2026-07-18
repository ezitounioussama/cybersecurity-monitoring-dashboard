import type { Prisma } from "@/generated/prisma/client";

export type IncidentRow = Prisma.IncidentGetPayload<{
  include: {
    assignedAnalyst: { select: { id: true; name: true; avatarUrl: true } };
    _count: { select: { incidentAlerts: true } };
  };
}>;

export type IncidentDetail = Prisma.IncidentGetPayload<{
  include: {
    assignedAnalyst: {
      select: { id: true; name: true; email: true; avatarUrl: true };
    };
    incidentAlerts: {
      include: {
        alert: {
          select: {
            id: true;
            title: true;
            severity: true;
            status: true;
            detectedAt: true;
          };
        };
      };
    };
    activities: {
      include: { user: { select: { id: true; name: true; avatarUrl: true } } };
    };
  };
}>;

export type AnalystOption = { id: string; name: string };
