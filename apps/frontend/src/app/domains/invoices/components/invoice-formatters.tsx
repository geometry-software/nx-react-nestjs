import type { ReactNode } from 'react';
import { Badge } from 'geometry-sdk/components';
import type { InvoiceStatus } from '../models/invoices.model';

export function InvoiceStatusBadge({ status, children }: { status: InvoiceStatus; children: ReactNode }) {
  const styles: Record<InvoiceStatus, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    complete: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <Badge className={styles[status]} variant="outline">
      {children}
    </Badge>
  );
}
