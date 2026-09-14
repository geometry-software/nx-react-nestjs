import type { ReactNode } from 'react';
import { Button } from '../ui/button';
import { Card, CardFooter } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';
export function getVisiblePages(current: number, total: number): PageItem[] {
  if (total <= 7)
    return Array.from({ length: Math.max(1, total) }, (_, index) => index + 1);
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((item) => item >= 1 && item <= total)
    .sort((a, b) => a - b);
  const result: PageItem[] = [];
  pages.forEach((item, index) => {
    const previous = pages[index - 1];
    if (previous && item - previous > 1)
      result.push(previous === 1 ? 'ellipsis-start' : 'ellipsis-end');
    result.push(item);
  });
  return result;
}

export type Column<T> = {
  label: string;
  className?: string;
  render: (row: T) => ReactNode;
};
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  loading,
  total,
  page,
  pageSize,
  pages,
  onPage,
  labels,
  itemLabel = 'items',
  selectedIds,
  onSelectedIdsChange,
}: {
  rows: T[];
  columns: Column<T>[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  onPage: (page: number) => void;
  labels: {
    empty: string;
    showing: string;
    pagination: string;
    previous: string;
    next: string;
    goToPage: (page: number) => string;
    selectAll?: string;
    selectRow?: (name: string) => string;
  };
  itemLabel?: string;
  selectedIds?: ReadonlySet<string>;
  onSelectedIdsChange?: (selectedIds: Set<string>) => void;
}) {
  const selectable = selectedIds !== undefined && onSelectedIdsChange !== undefined;
  const visibleIds = rows.map(({ id }) => id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedIds?.has(id),
  ).length;
  const allVisibleSelected = rows.length > 0 && selectedVisibleCount === rows.length;
  const columnCount = columns.length + (selectable ? 1 : 0);
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = total === 0 ? 0 : Math.min(total, first + rows.length - 1);
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label={labels.selectAll ?? 'Select all rows'}
                  checked={allVisibleSelected}
                  disabled={loading || rows.length === 0}
                  onCheckedChange={(checked) => {
                    const next = new Set(selectedIds);
                    visibleIds.forEach((id) =>
                      checked === true ? next.add(id) : next.delete(id),
                    );
                    onSelectedIdsChange(next);
                  }}
                />
              </TableHead>
            )}
            {columns.map((column, index) => (
              <TableHead
                className={column.className}
                key={`${column.label}-${index}`}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={columnCount}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow
                data-state={selectedIds?.has(row.id) ? 'selected' : undefined}
                key={row.id}
              >
                {selectable && (
                  <TableCell className="w-12 px-4">
                    <Checkbox
                      aria-label={labels.selectRow?.(row.id) ?? `Select row ${row.id}`}
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={(checked) => {
                        const next = new Set(selectedIds);
                        checked === true
                          ? next.add(row.id)
                          : next.delete(row.id);
                        onSelectedIdsChange(next);
                      }}
                    />
                  </TableCell>
                )}
                {columns.map((column, index) => (
                  <TableCell
                    className={column.className}
                    key={`${column.label}-${index}`}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-28 text-center text-muted-foreground"
                colSpan={columnCount}
              >
                {labels.empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CardFooter className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:justify-between">
        <span className="text-sm text-muted-foreground">
          {labels.showing
            .replace('{{first}}', String(first))
            .replace('{{last}}', String(last))
            .replace('{{total}}', String(total))
            .replace('{{items}}', itemLabel)}
        </span>
        <div
          className="flex flex-wrap items-center gap-1"
          aria-label={labels.pagination}
        >
          <Button
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            variant="outline"
          >
            {labels.previous}
          </Button>
          {getVisiblePages(page, pages).map((item) =>
            typeof item === 'number' ? (
              <Button
                aria-current={item === page ? 'page' : undefined}
                aria-label={labels.goToPage(item)}
                key={item}
                onClick={() => onPage(item)}
                size="icon"
                variant={item === page ? 'default' : 'ghost'}
              >
                {item}
              </Button>
            ) : (
              <span className="px-2 text-muted-foreground" key={item}>
                …
              </span>
            ),
          )}
          <Button
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            variant="outline"
          >
            {labels.next}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
