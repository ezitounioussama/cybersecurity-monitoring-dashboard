import { ZodError } from "zod";
import { ERROR_CODES } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types/api";

export type ActionResult<T> = ApiResponse<T>;

export function actionOk<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/** Translate thrown domain/validation errors into the action result envelope. */
export function actionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION,
        message: "Please correct the highlighted fields.",
        details: error.flatten().fieldErrors,
      },
    };
  }
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }
  logger.error("Unhandled action error", {
    error: error instanceof Error ? error.message : String(error),
  });
  return {
    success: false,
    error: { code: ERROR_CODES.INTERNAL, message: "Something went wrong." },
  };
}
