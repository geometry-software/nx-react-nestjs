import type { Product } from '../entities/product.entity';

export type ProductStockRequest = { productId: string; quantity: number };
export type UnavailableProductStock = {
  productId: string;
  requested: number;
  available: number;
};

export function requestedProductStock(items: readonly ProductStockRequest[]): Map<string, number> {
  const requested = new Map<string, number>();
  for (const { productId, quantity } of items) {
    requested.set(productId, (requested.get(productId) ?? 0) + quantity);
  }
  return requested;
}

export function planProductStockDeduction(
  requested: ReadonlyMap<string, number>,
  products: readonly Product[],
): { updates: { id: string; quantity: number }[]; unavailable: UnavailableProductStock[] } {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const unavailable = [...requested].flatMap(([productId, quantity]) => {
    const product = productsById.get(productId);
    const available = product?.quantity ?? 0;
    return !product || available < quantity
      ? [{ productId, requested: quantity, available }]
      : [];
  });
  const updates = products.map((product) => ({
    id: product.id,
    quantity: product.quantity - (requested.get(product.id) ?? 0),
  }));
  return { updates, unavailable };
}
