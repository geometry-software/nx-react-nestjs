import { dataService } from '../services/data.service';

const { apiService } = dataService;

const productsCollectionUrl = `${apiService.getServiceOrigin('products')}/api/products`;

export const productsApi = {
  list: (query: string) => `${productsCollectionUrl}?${query}`,
  byId: (id: string) =>
    `${productsCollectionUrl}/${encodeURIComponent(id)}`,
  create: productsCollectionUrl,
  bulkDelete: `${productsCollectionUrl}/bulk`,
};
