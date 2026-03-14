"use client";

import { useMemo, useState } from "react";

import { ArrowDown, ArrowUp, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

interface ResponsiveDataTableProps<T extends { id: string }> {
  title?: string;
  data: T[];
  columns: Column<T>[];
  searchableKeys: (keyof T)[];
  emptyMessage?: string;
  pageSize?: number;
}

export function ResponsiveDataTable<T extends { id: string }>({
  title,
  data,
  columns,
  searchableKeys,
  emptyMessage = "No records found.",
  pageSize = 10,
}: ResponsiveDataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;

    return data.filter((row) =>
      searchableKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(normalized)),
    );
  }, [data, query, searchableKeys]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;

    return [...filtered].sort((a, b) => {
      const left = String(a[sortBy] ?? "").toLowerCase();
      const right = String(b[sortBy] ?? "").toLowerCase();
      const base = left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? base : -base;
    });
  }, [filtered, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: keyof T) => {
    if (sortBy !== key) {
      setSortBy(key);
      setSortDirection("asc");
      return;
    }

    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="rounded-xl border bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 text-left font-semibold">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1",
                      column.sortable ? "hover:text-slate-900" : "cursor-default",
                    )}
                    onClick={() => (column.sortable ? toggleSort(column.key) : undefined)}
                  >
                    {column.label}
                    {sortBy === column.key ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.id} className="border-t hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={String(column.key)} className={cn("px-4 py-3 text-slate-700", column.className)}>
                      {column.render ? column.render(row) : String(row[column.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t p-4">
        <p className="text-xs text-slate-500">
          Showing {paginated.length} of {sorted.length}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            Previous
          </Button>
          <span className="inline-flex items-center px-2 text-sm text-slate-700">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
