"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

/**
 * Drives server-side DataTable state through URL search params so pages stay
 * shareable and the server component re-fetches on every change.
 */
export function useDataTableParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const commit = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const state = useMemo(() => {
    const sort = searchParams.get("sort");
    const [sortBy, sortDir] = sort?.split(".") ?? [];
    return {
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE),
      search: searchParams.get("q") ?? "",
      sortBy: sortBy || undefined,
      sortDir: (sortDir as "asc" | "desc" | undefined) || undefined,
    };
  }, [searchParams]);

  const setPage = useCallback(
    (page: number) => commit((p) => p.set("page", String(page))),
    [commit],
  );
  const setPageSize = useCallback(
    (size: number) =>
      commit((p) => {
        p.set("pageSize", String(size));
        p.set("page", "1");
      }),
    [commit],
  );
  const setSearch = useCallback(
    (value: string) =>
      commit((p) => {
        value ? p.set("q", value) : p.delete("q");
        p.set("page", "1");
      }),
    [commit],
  );
  const setSort = useCallback(
    (field: string, dir: "asc" | "desc") =>
      commit((p) => p.set("sort", `${field}.${dir}`)),
    [commit],
  );
  const getFilter = useCallback(
    (key: string) => searchParams.get(key)?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );
  const setFilter = useCallback(
    (key: string, values: string[]) =>
      commit((p) => {
        values.length ? p.set(key, values.join(",")) : p.delete(key);
        p.set("page", "1");
      }),
    [commit],
  );

  return {
    ...state,
    isPending,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    getFilter,
    setFilter,
  };
}
