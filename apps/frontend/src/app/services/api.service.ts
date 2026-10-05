import {
  type BaseQueryFn,
  createApi,
  fetchBaseQuery,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type {
  RequestActivityService,
  RequestMethod,
} from './request-activity.service';

export type ServiceName =
  | 'login'
  | 'products'
  | 'shipping'
  | 'invoices';

declare const __SERVICE_PORTS__: Readonly<Record<ServiceName, number>>;

export class ApiService {
  private readonly fetchQuery = fetchBaseQuery();

  public constructor(
    private readonly requestActivityService: RequestActivityService,
  ) {}

  public readonly api = createApi({
    reducerPath: 'api',
    baseQuery: this.createTrackedBaseQuery(),
    endpoints: () => ({}),
  });

  public get(url: string): FetchArgs {
    return this.createRequest('GET', url);
  }

  public post<TBody>(url: string, body?: TBody): FetchArgs {
    return this.createRequest('POST', url, body);
  }

  public put<TBody>(url: string, body: TBody): FetchArgs {
    return this.createRequest('PUT', url, body);
  }

  public delete<TBody>(url: string, body?: TBody): FetchArgs {
    return this.createRequest('DELETE', url, body);
  }

  public getServiceOrigin(service: ServiceName): string {
    const origin = new URL(window.location.origin);
    origin.port = String(this.getServicePort(service));
    return origin.origin;
  }

  public getServicePort(service: ServiceName): number {
    return __SERVICE_PORTS__[service];
  }

  private createRequest<TBody>(
    method: RequestMethod,
    url: string,
    body?: TBody,
  ): FetchArgs {
    return { url, method, body };
  }

  private createTrackedBaseQuery(): BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > {
    return async (args, apiContext, extraOptions) => {
      const finishRequest = this.requestActivityService.track(
        this.getRequestMethod(args),
      );
      try {
        return await this.fetchQuery(args, apiContext, extraOptions);
      } finally {
        finishRequest();
      }
    };
  }

  private getRequestMethod(args: string | FetchArgs): RequestMethod {
    if (typeof args === 'string') return 'GET';

    const method = String(args.method ?? 'GET').toUpperCase();
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      return method;
    }

    return 'GET';
  }
}
