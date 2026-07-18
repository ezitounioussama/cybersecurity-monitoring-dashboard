import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

export const userRoleSchema = z.object({
  role: z.enum(Role),
});

export const userActiveSchema = z.object({
  isActive: z.boolean(),
});

/** PATCH body for the REST route — either field may be present. */
export const userPatchSchema = z
  .object({
    role: z.enum(Role).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.role !== undefined || v.isActive !== undefined, {
    message: "Provide at least one of role or isActive.",
  });

export type UserRoleInput = z.infer<typeof userRoleSchema>;
export type UserActiveInput = z.infer<typeof userActiveSchema>;
export type UserPatchInput = z.infer<typeof userPatchSchema>;
