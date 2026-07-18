"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type ReactNode, useMemo, useState } from "react";
import {
  DataTableToolbar,
  type TableFacet,
} from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type CsvColumn, downloadCsv, toCsv } from "@/lib/csv-export";

type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  facets?: TableFacet[];
  csv?: { filename: string; columns: CsvColumn<T>[] };
  canExport?: boolean;
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  emptyState?: ReactNode;
};

export function DataTable<T>({
  columns,
  data,
  page,
  pageSize,
  pageCount,
  total,
  getRowId,
  searchPlaceholder,
  facets,
  csv,
  canExport,
  bulkActions,
  emptyState,
}: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = useState({});
  const selectable = Boolean(bulkActions);

  const allColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!selectable) return columns;
    const selectCol: ColumnDef<T, unknown> = {
      id: "select",
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
    };
    return [selectCol, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { rowSelection },
    getRowId,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    enableRowSelection: selectable,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  function handleExport() {
    if (!csv) return;
    const rows = selectedRows.length ? selectedRows : data;
    downloadCsv(csv.filename, toCsv(rows, csv.columns));
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        facets={facets}
        canExport={canExport && Boolean(csv)}
        onExport={handleExport}
        bulkActions={
          selectedRows.length > 0 && bulkActions
            ? bulkActions(selectedRows, () => setRowSelection({}))
            : null
        }
      />
      <div className="overflow-hidden rounded-xl border">
        <div className="max-h-[calc(100vh-20rem)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="hover:bg-transparent">
                  {group.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={allColumns.length} className="h-64 p-0">
                    {emptyState ?? (
                      <p className="py-16 text-center text-sm text-muted-foreground">
                        No results found.
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        pageCount={pageCount}
        total={total}
        selectedCount={selectedRows.length}
      />
    </div>
  );
}
