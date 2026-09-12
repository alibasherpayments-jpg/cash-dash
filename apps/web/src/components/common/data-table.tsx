"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  emptyState?: ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, data, getRowKey, totalPages = 1, currentPage = 1, onPageChange, onSort, emptyState, className }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 text-left font-medium text-muted-foreground", col.sortable && "cursor-pointer hover:text-foreground", col.className)}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && <ChevronsUpDown className="h-3 w-3" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  {emptyState ?? <span className="text-muted-foreground">No data found</span>}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={getRowKey(row)} className="border-t transition-colors hover:bg-muted/50">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3", col.className)}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
