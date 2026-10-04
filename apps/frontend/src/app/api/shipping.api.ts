import { dataService } from '../services/data.service';

const { apiService } = dataService;

const shippingOrigin = apiService.getServiceOrigin('shipping');
const shipmentsCollectionUrl = `${shippingOrigin}/api/shippings`;

export type CitiesApiQuery = {
  country: string;
  search: string;
};

export const shippingApi = {
  list: (query: string) => `${shipmentsCollectionUrl}?${query}`,
  byId: (id: string) =>
    `${shipmentsCollectionUrl}/${encodeURIComponent(id)}`,
  create: shipmentsCollectionUrl,
  bulkDelete: `${shipmentsCollectionUrl}/bulk`,
  refreshTracking: (id: string) =>
    `${shipmentsCollectionUrl}/${encodeURIComponent(id)}/tracking/refresh`,
  countries: `${shippingOrigin}/api/locations/countries`,
  cities: ({ country, search }: CitiesApiQuery) => {
    const query = new URLSearchParams({ country, search });
    return `${shippingOrigin}/api/locations/cities?${query}`;
  },
};
