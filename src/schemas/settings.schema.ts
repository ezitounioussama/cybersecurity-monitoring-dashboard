import { z } from "zod";

/**
 * Organization profile. The name is the only user-editable field (slug + plan
 * are managed via Clerk / billing). Simple enough that a single schema serves
 * both the react-hook-form input and the server action re-parse — it is a
 * plain trimmed string with no preprocess/coerce/defaults, so the form's
 * input and output types already match (see FEATURE_RECIPE dual-schema note).
 */
export const orgProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be at most 120 characters"),
});

export type OrgProfileValues = z.infer<typeof orgProfileSchema>;
