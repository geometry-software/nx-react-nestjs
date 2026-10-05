import type { InvoiceInput } from '../domains/invoices/models/invoices.model';
import type { Product } from '../domains/products/models/products.model';

export const calculateProductInvoiceTotal = (
  products: readonly Product[],
  quantities: Readonly<Record<string, string>>,
): number =>
  products.reduce(
    (total, product) =>
      total + product.price * (Number(quantities[product.id]) || 0),
    0,
  );

export const buildProductInvoiceInput = (
  name: string,
  description: string,
  products: readonly Product[],
  quantities: Readonly<Record<string, string>>,
): InvoiceInput | null => {
  if (name.trim().length < 2 || products.length === 0) return null;

  const hasInvalidQuantity = products.some((product) => {
    const quantity = Number(quantities[product.id]);
    return !Number.isInteger(quantity) || quantity < 1 || quantity > product.quantity;
  });
  if (hasInvalidQuantity) return null;

  return {
    name: name.trim(),
    description: description.trim() || undefined,
    items: products.map((product) => ({
      productId: product.id,
      quantity: Number(quantities[product.id]),
    })),
  };
};
