import type { ServiceName } from '../services/api.service';
import { getDataService } from '../services/data.service';

const { apiService } = getDataService();

export const swaggerServices: Array<{ name: ServiceName; port: number }> = [
  { name: 'login', port: apiService.getServicePort('login') },
  { name: 'products', port: apiService.getServicePort('products') },
  { name: 'shipping', port: apiService.getServicePort('shipping') },
  { name: 'invoices', port: apiService.getServicePort('invoices') },
];
