import { getDataService } from '../services/data.service';

const { apiService } = getDataService();

const authCollectionUrl = `${apiService.getServiceOrigin('login')}/api/auth`;

export const authApi = {
  login: `${authCollectionUrl}/login`,
  register: `${authCollectionUrl}/register`,
  session: `${authCollectionUrl}/session`,
  verifyEmail: `${authCollectionUrl}/verify-email`,
} satisfies Record<'login' | 'register' | 'session' | 'verifyEmail', string>;
