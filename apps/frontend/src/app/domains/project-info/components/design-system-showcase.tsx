import type { ReactNode } from 'react';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'geometry-sdk/components';

export function DesignSystemShowcase({
  badgeLabel,
  children,
  className = '',
  description,
  name,
}: {
  badgeLabel: string;
  children: ReactNode;
  className?: string;
  description: string;
  name: string;
}) {
  return (
    <Card className={`h-full ${className}`}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-mono text-lg">{name}</CardTitle>
          <Badge variant="outline">{badgeLabel}</Badge>
        </div>
        <CardDescription className="leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-24 flex-wrap items-center gap-3 rounded-lg border bg-muted/20 p-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
