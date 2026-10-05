import { invoicesDefaultListQuery } from '@/app/api/invoices.api';
import { useCreateInvoiceMutation } from '../../invoices/service/invoices.service';
import { useProductsService } from './products.service';
import type { InvoiceInput } from '../../invoices/models/invoices.model';
import type { Product } from '../models/products.model';

/** Coordinates product data and invoice creation for the product invoice flow. */
export function useProductInvoiceService(query: string, enabled = true) {
  const products = useProductsService(query, enabled);
  const [createInvoiceMutation, createInvoiceState] = useCreateInvoiceMutation();

  return {
    ...products,
    selectProducts: (selectedIds: ReadonlySet<string>): Product[] => {
      const availableProducts: Product[] = products.listQuery.data?.data ?? [];
      return availableProducts.filter(({ id }) => selectedIds.has(id));
    },
    createInvoice: async (body: InvoiceInput) => {
      const invoice = await createInvoiceMutation({
        body,
        cacheKey: invoicesDefaultListQuery,
      }).unwrap();
      void products.listQuery.refetch();
      return invoice;
    },
    isCreatingInvoice: createInvoiceState.isLoading,
  };
}
