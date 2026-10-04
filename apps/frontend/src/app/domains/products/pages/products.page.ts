import { useProductsFeature } from '../feature/products.feature';
import {
  type ProductsPageModel,
  ProductsPageModelInstance,
} from '../models/products.page.model';

export function useProductsPage(): ProductsPageModel {
  return new ProductsPageModelInstance(useProductsFeature());
}
