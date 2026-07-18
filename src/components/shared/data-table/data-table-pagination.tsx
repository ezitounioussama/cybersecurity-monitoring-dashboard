"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataTableParams } from "@/hooks/use-data-table";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";

type Props = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  selectedCount?: number;
};

export function DataTablePagination({
  page,
  pageSize,
  pageCount,
  total,
  selectedCount = 0,
}: Props) {
  const { setPage, setPageSize } = useDataTableParams();

  return (
    <div className="flex flex-col items-center gap-3 px-1 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {selectedCount > 0
          ? `${selectedCount} selected · ${total} total`
          : `${total} row${total === 1 ? "" : "s"}`}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger size="sm" className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => setPage(1)}>
            <IconChevronsLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <IconChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>
            <IconChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" disabled={page >= pageCount} onClick={() => setPage(pageCount)}>
            <IconChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
