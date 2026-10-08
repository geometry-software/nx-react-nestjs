import type { CreateInvoiceDto } from '../dto/invoice.dto';
import { InvoiceStatus, type InvoiceItem } from '../entities/invoice.entity';
import type { InvoiceProduct } from '../integrations/ports/products-port.adapter';
import type { CreateInvoiceRecord } from '../invoice.types';

export function unavailableInvoiceProducts(
  selections: CreateInvoiceDto['items'],
  products: readonly InvoiceProduct[],
): { productId: string; requested: number; available: number }[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return selections.flatMap(({ productId, quantity }) => {
    const product = byId.get(productId);
    const available = product?.quantity ?? 0;
    return !product || !product.active || available < quantity
      ? [{ productId, requested: quantity, available }]
      : [];
  });
}

export function buildInvoiceRecord(
  dto: CreateInvoiceDto,
  products: readonly InvoiceProduct[],
): CreateInvoiceRecord {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const items = dto.items.map(({ productId, quantity }): InvoiceItem => {
    const product = productsById.get(productId)!;
    return {
      productId,
      name: product.name,
      description: product.description ?? '',
      unitPrice: product.price,
      quantity,
    };
  });
  return {
    name: dto.name.trim(),
    description: dto.description?.trim() ?? '',
    status: InvoiceStatus.Pending,
    items,
    total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  };
}
