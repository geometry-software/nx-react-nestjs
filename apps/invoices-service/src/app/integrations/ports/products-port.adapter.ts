export type InvoiceProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  active: boolean;
};

export type StockSelection = { productId: string; quantity: number };

export abstract class ProductsAdapterPort {
  abstract resolveProducts(ids: string[]): Promise<InvoiceProduct[]>;
  abstract deductStock(items: StockSelection[]): Promise<void>;
}

