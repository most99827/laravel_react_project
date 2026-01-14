"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  onParamsChange?: (params: any) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onParamsChange
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  // Handle server-side search
  const onSearch = (value: string) => {
    onParamsChange?.({ search: value, page: 1 }); // Reset to page 1 on search
  };

  // Handle server-side pagination
  const onPageChange = (page: number) => {
    onParamsChange?.({ page });
  }

  const onPerPageChange = (pageSize: number) => {
    onParamsChange?.({ per_page: pageSize, page: 1 });
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Only use client-side pagination if meta is NOT provided
    getPaginationRowModel: !meta ? getPaginationRowModel() : undefined,
    getFilteredRowModel: !meta ? getFilteredRowModel() : undefined,
    state: {
      columnFilters,
    },
    manualPagination: !!meta,
    pageCount: meta?.last_page ?? -1,
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          defaultValue={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('search') ?? "" : ""}
          onChange={(event) => {
            if (onParamsChange) {
              onSearch(event.target.value);
            } else {
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
          }}
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={`${meta ? meta.per_page : table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const size = Number(value);
              if (onParamsChange) {
                onPerPageChange(size);
              } else {
                table.setPageSize(size)
              }
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={meta ? meta.per_page : "10"} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-neutral-500">
          {meta && (
            <span>
              Showing {meta.from} to {meta.to} of {meta.total} results
            </span>
          )}
        </div>
        <Pagination className="justify-end w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (meta && meta.current_page > 1) onPageChange(meta.current_page - 1);
                  else if (!meta && table.getCanPreviousPage()) table.previousPage();
                }}
                className={(!meta && !table.getCanPreviousPage()) || (meta && meta.current_page === 1) ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {meta && (
              <>
                {/* First Page */}
                {meta.current_page > 3 && (
                  <PaginationItem>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(1); }}>1</PaginationLink>
                  </PaginationItem>
                )}
                {meta.current_page > 4 && <PaginationItem><PaginationEllipsis /></PaginationItem>}

                {/* Surrounding Pages - Simplified Logic */}
                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                  .filter(page => page >= meta.current_page - 2 && page <= meta.current_page + 2)
                  .map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === meta.current_page}
                        onClick={(e) => { e.preventDefault(); onPageChange(page); }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))
                }

                {meta.current_page < meta.last_page - 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}

                {meta.current_page < meta.last_page - 2 && (
                  <PaginationItem>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(meta.last_page); }}>{meta.last_page}</PaginationLink>
                  </PaginationItem>
                )}
              </>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (meta && meta.current_page < meta.last_page) onPageChange(meta.current_page + 1);
                  else if (!meta && table.getCanNextPage()) table.nextPage();
                }}
                className={(!meta && !table.getCanNextPage()) || (meta && meta.current_page === meta.last_page) ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
