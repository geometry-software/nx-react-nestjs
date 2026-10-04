import type { ServiceName } from '../services/api.service';
import { dataService } from '../services/data.service';

const { apiService } = dataService;

export const swaggerServices: Array<{ name: ServiceName; port: number }> = [
  { name: 'auth', port: apiService.getServicePort('auth') },
  { name: 'products', port: apiService.getServicePort('products') },
  { name: 'shipping', port: apiService.getServicePort('shipping') },
  { name: 'invoices', port: apiService.getServicePort('invoices') },
];
