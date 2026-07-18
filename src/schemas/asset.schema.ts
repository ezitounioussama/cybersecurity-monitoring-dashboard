import { z } from "zod";
import { AssetCriticality, AssetStatus } from "@/generated/prisma/enums";
import { id, optionalText, requiredText } from "@/lib/zod";

export const assetCreateSchema = z.object({
  hostname: requiredText(1, 255),
  ipAddress: requiredText(1, 45),
  operatingSystem: requiredText(1, 120),
  criticality: z.enum(AssetCriticality).default("MEDIUM"),
  status: z.enum(AssetStatus).default("ACTIVE"),
  ownerId: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    id().optional(),
  ),
  lastScanAt: z.coerce.date().optional(),
});

export const assetUpdateSchema = assetCreateSchema.partial();

/** Plain-string form schema so react-hook-form input/output types match. */
export const assetFormSchema = z.object({
  hostname: z.string().trim().min(1, "Hostname is required").max(255),
  ipAddress: z.string().trim().min(1, "IP address is required").max(45),
  operatingSystem: z.string().trim().min(1, "OS is required").max(120),
  criticality: z.enum(AssetCriticality),
  status: z.enum(AssetStatus),
  ownerId: z.string(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;
export type AssetCreateInput = z.infer<typeof assetCreateSchema>;
export type AssetUpdateInput = z.infer<typeof assetUpdateSchema>;
