"use client";

import { useState, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/shared/table-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Column<T> {
  /** Column header label. */
  header: ReactNode;
  /** Cell renderer. */
  cell: (row: T) => ReactNode;
  className?: string;
  headClassName?: string;
}

export interface RowAction<T> {
  label: string;
  onSelect: (row: T) => void;
  /** Render in a destructive style. */
  destructive?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  /** Kebab-menu actions rendered in a trailing "Action" column. */
  actions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  /** When set, paginate client-side at this page size and render a footer pager. */
  pageSize?: number;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  actions,
  onRowClick,
  emptyMessage = "No records found.",
  isLoading = false,
  pageSize,
}: DataTableProps<T>) {
  const colSpan = columns.length + (actions ? 1 : 0);

  const [page, setPage] = useState(1);
  const pageCount = pageSize ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  // Reset to the first page when the dataset size changes (render-phase, not an
  // effect — avoids cascading-render lint and is React's recommended pattern).
  const [prevLength, setPrevLength] = useState(data.length);
  if (prevLength !== data.length) {
    setPrevLength(data.length);
    setPage(1);
  }
  const currentPage = Math.min(page, pageCount);
  const rows = pageSize
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  return (
    <div>
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={cn("text-xs uppercase tracking-wide text-muted-foreground", col.headClassName)}
              >
                {col.header}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label="Row actions" />
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, ai) => (
                          <DropdownMenuItem
                            key={ai}
                            variant={action.destructive ? "destructive" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onSelect(row);
                            }}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
      {pageSize && !isLoading ? (
        <TablePagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
