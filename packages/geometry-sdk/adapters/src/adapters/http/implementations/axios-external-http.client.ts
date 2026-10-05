import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import { randomUUID } from 'node:crypto';
import { ExternalHttpClient } from '../models/external-http-client.port.js';
import type {
  ExternalHttpActivity,
  ExternalHttpActivityListener,
  ExternalHttpRequest,
  ExternalHttpRetryPolicy,
} from '../models/external-http.models.js';

type UpstreamActivity = { inFlight: number; lastDurationMs: number | null };

@Injectable()
export class AxiosExternalHttpClient implements ExternalHttpClient {
  private readonly logger = new Logger(AxiosExternalHttpClient.name);
  private readonly client: AxiosInstance;
  private readonly activity = new Map<string, UpstreamActivity>();
  private readonly listeners = new Set<ExternalHttpActivityListener>();

  constructor() {
    this.client = axios.create({
      timeout: 5_000,
      headers: { Accept: 'application/json' },
      maxRedirects: 5,
      maxContentLength: 5 * 1024 * 1024,
      maxBodyLength: 5 * 1024 * 1024,
      transitional: { clarifyTimeoutError: true },
    });
    this.client.interceptors.request.use((config) => {
      const headers = AxiosHeaders.from(config.headers);
      if (!headers.has('x-request-id')) headers.set('x-request-id', randomUUID());
      config.headers = headers;
      return config;
    });
  }

  async execute<T>(request: ExternalHttpRequest<T>): Promise<T> {
    const startedAt = performance.now();
    this.start(request.service);
    try {
      const retry = this.resolveRetryPolicy(request);
      let lastError: unknown;
      for (let attempt = 1; attempt <= retry.attempts; attempt += 1) {
        try {
          const response = await this.client.request<T>({
            ...request.config,
            url: request.url,
            timeout: request.timeoutMs,
          });
          return response.data;
        } catch (error) {
          lastError = error;
          if (attempt >= retry.attempts || !this.isRetryable(error)) break;
          await this.waitForRetry(error, retry, attempt, request.config?.signal);
        }
      }
      if ('fallback' in request) return request.fallback as T;
      throw this.toHttpException(request.service, lastError);
    } finally {
      const duration = Math.max(0, Math.round(performance.now() - startedAt));
      this.finish(request.service, duration);
      this.logger.debug(`${request.service} request completed in ${duration} ms`);
    }
  }

  getActivity(service?: string): ExternalHttpActivity {
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

  subscribe(listener: ExternalHttpActivityListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private resolveRetryPolicy<T>(
    request: ExternalHttpRequest<T>,
  ): ExternalHttpRetryPolicy {
    if (request.retry === false) return { attempts: 1 };
    if (request.retry)
      return { ...request.retry, attempts: Math.max(1, request.retry.attempts) };
    const method = String(request.config?.method ?? 'GET').toUpperCase();
    return { attempts: method === 'GET' || method === 'HEAD' ? 3 : 1 };
  }

  private isRetryable(error: unknown): boolean {
    if (!axios.isAxiosError(error) || error.code === AxiosError.ERR_CANCELED)
      return false;
    const status = error.response?.status;
    return status === undefined || status === 408 || status === 429 || status >= 500;
  }

  private async waitForRetry(
    error: unknown,
    policy: ExternalHttpRetryPolicy,
    attempt: number,
    signal?: AxiosRequestConfig['signal'],
  ): Promise<void> {
    const retryAfter = axios.isAxiosError(error)
      ? Number(error.response?.headers['retry-after']) * 1_000
      : Number.NaN;
    const exponential = (policy.baseDelayMs ?? 150) * 2 ** (attempt - 1);
    const delay = Math.min(
      policy.maxDelayMs ?? 1_500,
      Number.isFinite(retryAfter)
        ? retryAfter
        : exponential + Math.random() * 100,
    );
    await new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new AxiosError('Request cancelled', AxiosError.ERR_CANCELED));
        return;
      }
      const timer = setTimeout(resolve, delay);
      signal?.addEventListener?.(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new AxiosError('Request cancelled', AxiosError.ERR_CANCELED));
        },
        { once: true },
      );
    });
  }

  private toHttpException(service: string, error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return new BadGatewayException({
        message: `${service} rejected the request`,
        service,
        upstreamStatus: error.response.status,
      });
    }
    return new ServiceUnavailableException(`${service} is unavailable`, {
      cause: error,
    });
  }

  private start(service: string) {
    const current = this.activity.get(service) ?? {
      inFlight: 0,
      lastDurationMs: null,
    };
    this.activity.set(service, { ...current, inFlight: current.inFlight + 1 });
    this.emit(service);
  }

  private finish(service: string, lastDurationMs: number) {
    const current = this.activity.get(service) ?? {
      inFlight: 1,
      lastDurationMs: null,
    };
    this.activity.set(service, {
      inFlight: Math.max(0, current.inFlight - 1),
      lastDurationMs,
    });
    this.emit(service);
  }

  private emit(service: string) {
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
