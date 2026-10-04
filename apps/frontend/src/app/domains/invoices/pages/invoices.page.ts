import {
  type InvoicesPageModel,
  InvoicesPageModelInstance,
} from '../models/invoices.page.model';
import { useInvoicesFeature } from '../feature/invoices.feature';

export function useInvoicesPage(): InvoicesPageModel {
  return new InvoicesPageModelInstance(useInvoicesFeature());
}
