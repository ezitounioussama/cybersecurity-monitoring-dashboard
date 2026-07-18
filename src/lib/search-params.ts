import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/constants";
import type { ListParams } from "@/types/api";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse shared DataTable list params from a Next.js page `searchParams` object. */
export function readListParams(sp: SearchParamsInput): ListParams {
  const maxPageSize = PAGE_SIZE_OPTIONS.at(-1) ?? 100;
  const page = Math.max(1, Number(first(sp.page) ?? "1") || 1);
  const requested = Number(first(sp.pageSize) ?? DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, requested || DEFAULT_PAGE_SIZE),
  );
  const [sortBy, sortDir] = first(sp.sort)?.split(".") ?? [];
  return {
    page,
    pageSize,
    search: first(sp.q) || undefined,
    sortBy: sortBy || undefined,
    sortDir: sortDir === "asc" || sortDir === "desc" ? sortDir : undefined,
  };
}

/** Read a comma-separated multi-value filter (e.g. severity=HIGH,CRITICAL). */
export function readArray(sp: SearchParamsInput, key: string): string[] {
  const value = sp[key];
  if (!value) return [];
  return (Array.isArray(value) ? value.join(",") : value)
    .split(",")
    .filter(Boolean);
}
