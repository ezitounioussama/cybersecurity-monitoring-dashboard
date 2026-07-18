import { z } from "zod";
import { AlertStatus, Severity } from "@/generated/prisma/enums";
import { id, optionalText, requiredText } from "@/lib/zod";

export const alertCreateSchema = z.object({
  title: requiredText(3, 200),
  description: requiredText(1, 2000),
  severity: z.enum(Severity),
  status: z.enum(AlertStatus).default("OPEN"),
  source: requiredText(1, 100),
  rule: requiredText(1, 200),
  sourceIp: optionalText(45),
  destinationIp: optionalText(45),
  destinationAssetId: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    id().optional(),
  ),
  rawLog: optionalText(10_000),
  detectedAt: z.coerce.date().optional(),
});

export const alertUpdateSchema = alertCreateSchema.partial();

export const alertStatusSchema = z.object({
  status: z.enum(AlertStatus),
});

/**
 * Client form schema — plain strings (no preprocess/coerce/defaults) so the
 * react-hook-form input and output types match. The server action re-parses
 * with alertCreateSchema, which normalizes empty strings and coerces dates.
 */
export const alertFormSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(200),
  description: z.string().trim().min(1, "Description is required").max(2000),
  severity: z.enum(Severity),
  status: z.enum(AlertStatus),
  source: z.string().trim().min(1, "Source is required").max(100),
  rule: z.string().trim().min(1, "Rule is required").max(200),
  sourceIp: z.string().trim().max(45),
  destinationIp: z.string().trim().max(45),
  rawLog: z.string().trim().max(10_000),
});

export type AlertFormValues = z.infer<typeof alertFormSchema>;
export type AlertCreateInput = z.infer<typeof alertCreateSchema>;
export type AlertUpdateInput = z.infer<typeof alertUpdateSchema>;
