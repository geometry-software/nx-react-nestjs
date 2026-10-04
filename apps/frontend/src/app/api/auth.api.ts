import { dataService } from '../services/data.service';

const { apiService } = dataService;

const authCollectionUrl = `${apiService.getServiceOrigin('auth')}/api/auth`;

export const authApi = {
  login: `${authCollectionUrl}/login`,
  register: `${authCollectionUrl}/register`,
};
