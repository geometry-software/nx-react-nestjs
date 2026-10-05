import { getDataService } from '../services/data.service';

const { apiService } = getDataService();

const usersCollectionUrl = `${apiService.getServiceOrigin('login')}/api/users`;

export const usersPickerListQuery =
  'page=1&limit=100&sort=name&order=asc';

export const usersApi = {
  list: (query: string) => `${usersCollectionUrl}?${query}`,
  byId: (id: string) => `${usersCollectionUrl}/${encodeURIComponent(id)}`,
  bulkDelete: `${usersCollectionUrl}/bulk`,
} satisfies Record<
  'list' | 'byId' | 'bulkDelete',
  string | ((value: string) => string)
>;
