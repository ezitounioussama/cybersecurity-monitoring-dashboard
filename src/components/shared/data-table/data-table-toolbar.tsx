"use client";

import { IconDownload, IconX } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
  DataTableFacetedFilter,
  type FacetOption,
} from "@/components/shared/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { useDataTableParams } from "@/hooks/use-data-table";

export type TableFacet = {
  filterKey: string;
  title: string;
  options: FacetOption[];
};

type Props<T> = {
  table: Table<T>;
  searchPlaceholder?: string;
  facets?: TableFacet[];
  canExport?: boolean;
  onExport?: () => void;
  bulkActions?: ReactNode;
};

export function DataTableToolbar<T>({
  table,
  searchPlaceholder,
  facets = [],
  canExport,
  onExport,
  bulkActions,
}: Props<T>) {
  const { getFilter, setFilter, search, setSearch } = useDataTableParams();
  const activeFilters = facets.some((f) => getFilter(f.filterKey).length > 0);
  const hasReset = activeFilters || search.length > 0;

  function resetAll() {
    setSearch("");
    facets.forEach((f) => setFilter(f.filterKey, []));
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <SearchBar placeholder={searchPlaceholder} />
        {facets.map((facet) => (
          <DataTableFacetedFilter key={facet.filterKey} {...facet} />
        ))}
        {hasReset && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2"
            onClick={resetAll}
          >
            Reset
            <IconX className="size-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {bulkActions}
        {canExport && onExport && (
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={onExport}
          >
            <IconDownload className="size-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
