import { cn } from 'cn';

export function EmptyList({
  className,
  description = 'No items found.',
}: {
  className?: string;
  description?: string;
}) {
  return (
    <div
      className={cn('flex min-h-24 w-full items-center justify-center rounded-xl border border-border bg-card p-3 text-center text-sm text-muted-foreground', className)}
      role="status"
    >
      {description}
    </div>
  );
}
