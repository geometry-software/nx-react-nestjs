import { ApiService } from './api.service';
import { RequestActivityService } from './request-activity.service';
import type { DataService } from '../models/data-service.model';

let dataService: DataService | undefined;

/**
 * Returns the shared API and request activity services.
 * The first caller creates these services; this can happen during module import,
 * before React renders the app. Later calls return the same instances for this
 * loaded module and do not create new services.
 */
export const getDataService = (): DataService => {
  if (!dataService) {
    const requestActivityService = new RequestActivityService();
    const apiService = new ApiService(requestActivityService);
    dataService = { apiService, requestActivityService };
  }

  return dataService;
};
