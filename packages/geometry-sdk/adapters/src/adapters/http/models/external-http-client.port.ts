import type {
  ExternalHttpActivity,
  ExternalHttpActivityListener,
  ExternalHttpRequest,
} from './external-http.models.js';

export abstract class ExternalHttpClient {
  abstract execute<T>(request: ExternalHttpRequest<T>): Promise<T>;
  abstract getActivity(service?: string): ExternalHttpActivity;
  abstract subscribe(listener: ExternalHttpActivityListener): () => void;
}
