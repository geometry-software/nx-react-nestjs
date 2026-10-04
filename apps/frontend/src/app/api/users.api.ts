import { dataService } from '../services/data.service';

const { apiService } = dataService;

const usersCollectionUrl = `${apiService.getServiceOrigin('auth')}/api/users`;

export const usersPickerListQuery =
  'page=1&limit=100&sort=name&order=asc';

export const usersApi = {
  list: (query: string) => `${usersCollectionUrl}?${query}`,
  byId: (id: string) => `${usersCollectionUrl}/${encodeURIComponent(id)}`,
  bulkDelete: `${usersCollectionUrl}/bulk`,
};
