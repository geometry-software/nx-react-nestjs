import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ExternalHttpClient } from '../models/external-http-client.port.js';
import type {
  ExternalHttpActivity,
  ExternalHttpActivityListener,
  ExternalHttpRequest,
  ExternalHttpRetryPolicy,
} from '../models/external-http.models.js';

type UpstreamActivity = { inFlight: number; lastDurationMs: number | null };

class UpstreamResponseError extends Error {
  constructor(public readonly status: number, public readonly retryAfter: string | null) {
    super(`Upstream returned HTTP ${status}`);
  }
}

/** Native fetch implementation of the HTTP adapter contract. */
@Injectable()
export class FetchAdapter implements ExternalHttpClient {
  private readonly logger = new Logger(FetchAdapter.name);
  private readonly activity = new Map<string, UpstreamActivity>();
  private readonly listeners = new Set<ExternalHttpActivityListener>();

  constructor(private readonly options: { baseUrl?: string; timeoutMs?: number } = {}) {}

  /** Sends an HTTP request and returns its decoded response. */
  public async execute<T>(request: ExternalHttpRequest<T>): Promise<T> {
    const startedAt = performance.now();
    this.start(request.service);
    try {
      const policy = this.resolveRetryPolicy(request);
      let lastError: unknown;
      for (let attempt = 1; attempt <= policy.attempts; attempt += 1) {
        try {
          const response = await this.send(request);
          if (!response.ok) {
            await response.body?.cancel();
            throw new UpstreamResponseError(response.status, response.headers.get('retry-after'));
          }
          return this.decode<T>(response);
        } catch (error) {
          lastError = error;
        }
        if (attempt >= policy.attempts || request.config?.signal?.aborted ||
            (lastError instanceof UpstreamResponseError && !this.isRetryableStatus(lastError.status))) break;
        await this.waitForRetry(
          lastError instanceof UpstreamResponseError ? lastError : undefined,
          policy,
          attempt,
          request.config?.signal instanceof AbortSignal ? request.config.signal : undefined,
        );
      }
      if ('fallback' in request) return request.fallback as T;
      throw this.toHttpException(request.service, lastError);
    } finally {
      const duration = Math.max(0, Math.round(performance.now() - startedAt));
      this.finish(request.service, duration);
      this.logger.debug(`${request.service} request completed in ${duration} ms`);
    }
  }

  private async decode<T>(response: Response): Promise<T> {
    const body = await response.text();
    if (!body) return undefined as T;
    try {
      return JSON.parse(body) as T;
    } catch {
      return body as T;
    }
  }

  /** Returns the current HTTP request activity snapshot. */
  public getActivity(service?: string): ExternalHttpActivity {
    if (service) return this.snapshot(this.activity.get(service));
    const states = [...this.activity.values()];
    return {
      active: states.some(({ inFlight }) => inFlight > 0),
      inFlight: states.reduce((sum, { inFlight }) => sum + inFlight, 0),
      lastDurationMs: states.reduce<number | null>(
        (latest, { lastDurationMs }) => lastDurationMs ?? latest,
        null,
      ),
    };
  }

  /** Subscribes to HTTP request activity and returns an unsubscribe function. */
  public subscribe(listener: ExternalHttpActivityListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async send<T>(request: ExternalHttpRequest<T>): Promise<Response> {
    const url = new URL(request.url, this.options.baseUrl ? `${this.options.baseUrl}/` : undefined);
    const params = request.config?.params;
    if (params && typeof params === 'object') {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
      }
    }
    const headers = new Headers({ Accept: 'application/json' });
    for (const [key, value] of Object.entries(request.config?.headers ?? {})) {
      if (value !== undefined && value !== null && value !== false) headers.set(key, String(value));
    }
    if (!headers.has('x-request-id')) headers.set('x-request-id', randomUUID());
    const data = request.config?.data as unknown;
    let body: RequestInit['body'];
    if (data !== undefined && data !== null) {
      if (typeof data === 'string' || data instanceof FormData || data instanceof Blob ||
          data instanceof URLSearchParams || data instanceof ArrayBuffer) {
        body = data;
      } else {
        body = JSON.stringify(data);
        if (!headers.has('content-type')) headers.set('content-type', 'application/json');
      }
    }
    const timeout = AbortSignal.timeout(request.timeoutMs ?? this.options.timeoutMs ?? 5_000);
    const configuredSignal = request.config?.signal;
    const signal = configuredSignal instanceof AbortSignal
      ? AbortSignal.any([configuredSignal, timeout]) : timeout;
    return fetch(url, {
      method: request.config?.method ?? 'GET',
      headers,
      body,
      signal,
      redirect: 'follow',
    });
  }

  private resolveRetryPolicy<T>(request: ExternalHttpRequest<T>): ExternalHttpRetryPolicy {
    if (request.retry === false) return { attempts: 1 };
    if (request.retry) return { ...request.retry, attempts: Math.max(1, request.retry.attempts) };
    const method = String(request.config?.method ?? 'GET').toUpperCase();
    return { attempts: method === 'GET' || method === 'HEAD' ? 3 : 1 };
  }

  private isRetryableStatus(status: number): boolean {
    return status === 408 || status === 429 || status >= 500;
  }

  private async waitForRetry(
    response: UpstreamResponseError | undefined,
    policy: ExternalHttpRetryPolicy,
    attempt: number,
    signal?: AbortSignal,
  ): Promise<void> {
    const retryAfter = Number(response?.retryAfter) * 1_000;
    const exponential = (policy.baseDelayMs ?? 150) * 2 ** (attempt - 1);
    const delay = Math.min(
      policy.maxDelayMs ?? 1_500,
      response?.retryAfter && Number.isFinite(retryAfter)
        ? retryAfter : exponential + Math.random() * 100,
    );
    await new Promise<void>((resolve, reject) => {
      if (signal?.aborted) return reject(signal.reason);
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, delay);
      const onAbort = () => {
        clearTimeout(timer);
        reject(signal?.reason);
      };
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  private toHttpException(service: string, error: unknown): Error {
    if (error instanceof UpstreamResponseError) {
      return new BadGatewayException({
        message: `${service} rejected the request`,
        service,
        upstreamStatus: error.status,
      });
    }
    return new ServiceUnavailableException(`${service} is unavailable`, { cause: error });
  }

  private start(service: string): void {
    const current = this.activity.get(service) ?? { inFlight: 0, lastDurationMs: null };
    this.activity.set(service, { ...current, inFlight: current.inFlight + 1 });
    this.emit(service);
  }

  private finish(service: string, lastDurationMs: number): void {
    const current = this.activity.get(service) ?? { inFlight: 1, lastDurationMs: null };
    this.activity.set(service, {
      inFlight: Math.max(0, current.inFlight - 1),
      lastDurationMs,
    });
    this.emit(service);
  }

  private emit(service: string): void {
    const activity = this.getActivity(service);
    this.listeners.forEach((listener) => listener(service, activity));
  }

  private snapshot(activity?: UpstreamActivity): ExternalHttpActivity {
    return {
      active: (activity?.inFlight ?? 0) > 0,
      inFlight: activity?.inFlight ?? 0,
      lastDurationMs: activity?.lastDurationMs ?? null,
    };
  }
}
