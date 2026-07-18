import { z } from "zod";
import { IncidentStatus, Severity } from "@/generated/prisma/enums";
import { id, requiredText } from "@/lib/zod";

export const incidentCreateSchema = z.object({
  title: requiredText(3, 200),
  description: requiredText(1, 4000),
  severity: z.enum(Severity),
  status: z.enum(IncidentStatus).default("NEW"),
  assignedAnalystId: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    id().optional(),
  ),
  evidenceUrls: z.array(z.string().url()).default([]),
});

export const incidentUpdateSchema = incidentCreateSchema.partial();

export const incidentStatusSchema = z.object({ status: z.enum(IncidentStatus) });

export const incidentAssignSchema = z.object({
  assignedAnalystId: z.preprocess(
    (v) => (v === "" || v === null ? null : v),
    id().nullable(),
  ),
});

export const incidentLinkAlertSchema = z.object({ alertId: id() });

/** Plain-input form schema — evidenceUrls is a newline-separated textarea string. */
export const incidentFormSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(200),
  description: z.string().trim().min(1, "Description is required").max(4000),
  severity: z.enum(Severity),
  status: z.enum(IncidentStatus),
  assignedAnalystId: z.string(),
  evidenceUrls: z.string(),
});

export type IncidentFormValues = z.infer<typeof incidentFormSchema>;
export type IncidentCreateInput = z.infer<typeof incidentCreateSchema>;
export type IncidentUpdateInput = z.infer<typeof incidentUpdateSchema>;
