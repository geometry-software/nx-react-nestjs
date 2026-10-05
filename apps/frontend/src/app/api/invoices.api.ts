import { getDataService } from '../services/data.service';

const { apiService } = getDataService();

const invoicesCollectionUrl = `${apiService.getServiceOrigin('invoices')}/api/invoices`;

export const invoicesDefaultListQuery =
  'page=1&limit=10&sort=createdAt&order=desc';
export const confirmedInvoicesListQuery =
  'page=1&limit=100&sort=name&order=asc&status=complete';

export const invoicesApi = {
  list: (query: string) => `${invoicesCollectionUrl}?${query}`,
  byId: (id: string) =>
    `${invoicesCollectionUrl}/${encodeURIComponent(id)}`,
  create: invoicesCollectionUrl,
  confirm: (id: string) =>
    `${invoicesCollectionUrl}/${encodeURIComponent(id)}/confirm`,
  cancel: (id: string) =>
    `${invoicesCollectionUrl}/${encodeURIComponent(id)}/cancel`,
} satisfies Record<
  'list' | 'byId' | 'create' | 'confirm' | 'cancel',
  string | ((value: string) => string)
>;
