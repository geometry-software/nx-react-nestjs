import { ApiService } from './api.service';
import { RequestActivityService } from './request-activity.service';

class DataService {
  public readonly requestActivityService: RequestActivityService;
  public readonly apiService: ApiService;

  public constructor() {
    this.requestActivityService = new RequestActivityService();
    this.apiService = new ApiService(this.requestActivityService);
  }
}

export const dataService = new DataService();
