import type { ReactNode } from 'react';
import { Badge } from 'geometry-sdk/components';

export function ProjectInfoHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header>
      {eyebrow && <Badge variant="secondary">{eyebrow}</Badge>}
      <div className={`${eyebrow ? 'mt-4 ' : ''}flex flex-wrap items-end justify-between gap-3`}>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
