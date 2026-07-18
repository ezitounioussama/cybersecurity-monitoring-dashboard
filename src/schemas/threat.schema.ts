import { z } from "zod";
import {
  IocType,
  ThreatConfidence,
  ThreatStatus,
} from "@/generated/prisma/enums";
import { optionalText, requiredText } from "@/lib/zod";

export const threatCreateSchema = z.object({
  ioc: requiredText(1, 500),
  iocType: z.enum(IocType),
  ipAddress: optionalText(45),
  domain: optionalText(255),
  hash: optionalText(128),
  source: requiredText(1, 100),
  confidence: z.enum(ThreatConfidence).default("MEDIUM"),
  status: z.enum(ThreatStatus).default("ACTIVE"),
  lastSeenAt: z.coerce.date().optional(),
});

export const threatUpdateSchema = threatCreateSchema.partial();

/**
 * Client form schema — plain strings (no preprocess/coerce/defaults) so the
 * react-hook-form input and output types match. The server action re-parses
 * with threatCreateSchema, which normalizes empty strings and coerces dates.
 */
export const threatFormSchema = z.object({
  ioc: z.string().trim().min(1, "IOC is required").max(500),
  iocType: z.enum(IocType),
  ipAddress: z.string().trim().max(45),
  domain: z.string().trim().max(255),
  hash: z.string().trim().max(128),
  source: z.string().trim().min(1, "Source is required").max(100),
  confidence: z.enum(ThreatConfidence),
  status: z.enum(ThreatStatus),
});

export type ThreatFormValues = z.infer<typeof threatFormSchema>;
export type ThreatCreateInput = z.infer<typeof threatCreateSchema>;
export type ThreatUpdateInput = z.infer<typeof threatUpdateSchema>;
