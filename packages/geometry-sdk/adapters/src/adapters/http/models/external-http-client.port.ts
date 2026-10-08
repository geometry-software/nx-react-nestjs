import type {
  ExternalHttpActivity,
  ExternalHttpActivityListener,
  ExternalHttpRequest,
} from './external-http.models.js';

export abstract class ExternalHttpClient {
  /** Sends an HTTP request and returns its decoded response. */
  abstract execute<T>(request: ExternalHttpRequest<T>): Promise<T>;
  /** Returns the current HTTP request activity snapshot. */
  abstract getActivity(service?: string): ExternalHttpActivity;
  /** Subscribes to HTTP request activity and returns an unsubscribe function. */
  abstract subscribe(listener: ExternalHttpActivityListener): () => void;
}
