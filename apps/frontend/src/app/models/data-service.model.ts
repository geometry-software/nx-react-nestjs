import type { ApiService } from '../services/api.service';
import type { RequestActivityService } from '../services/request-activity.service';

export type DataService = Readonly<{
  apiService: ApiService;
  requestActivityService: RequestActivityService;
}>;
