type SortDir = "asc" | "desc";

/** Build a safe Prisma orderBy, ignoring any sort field not in the allowlist. */
export function orderByFrom(
  sortBy: string | undefined,
  sortDir: SortDir | undefined,
  allowed: readonly string[],
  fallback: Record<string, SortDir>,
): Record<string, SortDir> {
  if (sortBy && allowed.includes(sortBy)) {
    return { [sortBy]: sortDir ?? "asc" };
  }
  return fallback;
}

/** Keep only values that are members of the given enum object. */
export function asEnumArray<T extends Record<string, string>>(
  values: string[] | undefined,
  enumObj: T,
): T[keyof T][] {
  if (!values?.length) return [];
  const members = new Set<string>(Object.values(enumObj));
  return values.filter((v) => members.has(v)) as T[keyof T][];
}

/** Build faceted-filter options from a centralized badge-styles map. */
export function facetOptions(
  styles: Record<string, { label: string }>,
): { label: string; value: string }[] {
  return Object.entries(styles).map(([value, { label }]) => ({ label, value }));
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
