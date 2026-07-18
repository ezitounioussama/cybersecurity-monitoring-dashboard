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

export type AlertCreateInput = z.infer<typeof alertCreateSchema>;
export type AlertUpdateInput = z.infer<typeof alertUpdateSchema>;
