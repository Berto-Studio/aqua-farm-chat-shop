import type { ReactNode } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  headerClassName?: string;
  cell: (row: T) => ReactNode;
  cellClassName?: string | ((row: T) => string | undefined);
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  loading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  emptyMessage?: string;
  containerClassName?: string;
  tableClassName?: string;
  rowClassName?: string | ((row: T) => string | undefined);
  pagination?: DataTablePagination;
}

const resolveClassName = <T,>(
  value: string | ((row: T) => string | undefined) | undefined,
  row: T,
) => {
  if (typeof value === "function") {
    return value(row);
  }

  return value;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  error,
  loadingMessage = "Loading...",
  emptyMessage = "No results found.",
  containerClassName,
  tableClassName,
  rowClassName,
  pagination,
}: DataTableProps<T>) {
  const colSpan = Math.max(columns.length, 1);
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? data.length;
  const pageSize = pagination?.pageSize ?? data.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);
  const previousDisabled =
    loading || currentPage <= 1 || Boolean(pagination?.previousDisabled);
  const nextDisabled =
    loading || currentPage >= totalPages || Boolean(pagination?.nextDisabled);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white",
        containerClassName,
      )}
    >
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="py-8 text-center text-muted-foreground"
              >
                {loadingMessage}
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="py-8 text-center text-destructive"
              >
                {error}
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={getRowKey(row, index)}
                className={resolveClassName(rowClassName, row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={resolveClassName(column.cellClassName, row)}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && !loading && !error && totalItems > 0 ? (
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startItem}-{endItem} of {totalItems}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Pagination className="mx-0 w-auto justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (!previousDisabled) {
                        pagination.onPrevious();
                      }
                    }}
                    className={cn(
                      previousDisabled && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (!nextDisabled) {
                        pagination.onNext();
                      }
                    }}
                    className={cn(
                      nextDisabled && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      ) : null}
    </div>
  );
}
