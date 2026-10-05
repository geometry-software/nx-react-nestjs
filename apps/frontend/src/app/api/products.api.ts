import { getDataService } from '../services/data.service';

const { apiService } = getDataService();

const productsCollectionUrl = `${apiService.getServiceOrigin('products')}/api/products`;

export const productsApi = {
  list: (query: string) => `${productsCollectionUrl}?${query}`,
  byId: (id: string) =>
    `${productsCollectionUrl}/${encodeURIComponent(id)}`,
  create: productsCollectionUrl,
  bulkDelete: `${productsCollectionUrl}/bulk`,
} satisfies Record<
  'list' | 'byId' | 'create' | 'bulkDelete',
  string | ((value: string) => string)
>;
