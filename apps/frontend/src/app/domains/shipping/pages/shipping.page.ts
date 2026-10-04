import {
  type ShippingPageModel,
  ShippingPageModelInstance,
} from '../models/shipping.page.model';
import { useShippingFeature } from '../feature/shipping.feature';

export function useShippingPage(): ShippingPageModel {
  return new ShippingPageModelInstance(useShippingFeature());
}
