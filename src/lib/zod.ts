import { z } from "zod";

/** Coerce empty strings/nulls (common from HTML forms) to undefined. */
export function optionalText(max = 255) {
  return z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().trim().max(max).optional(),
  );
}

export function requiredText(min = 1, max = 255) {
  return z.string().trim().min(min).max(max);
}

/** Local id — kept loose (cuid) to avoid coupling to a specific format check. */
export const id = () => z.string().min(1).max(64);
