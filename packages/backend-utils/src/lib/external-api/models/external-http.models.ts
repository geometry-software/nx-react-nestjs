import type { AxiosRequestConfig } from 'axios';

export type ExternalHttpRetryPolicy = {
  attempts: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

export type ExternalHttpRequest<T> = {
  provider: string;
  url: string;
  config?: Omit<AxiosRequestConfig, 'url' | 'timeout'>;
  timeoutMs?: number;
  retry?: ExternalHttpRetryPolicy | false;
  fallback?: T;
};

export type ExternalHttpActivity = {
  active: boolean;
  inFlight: number;
  lastDurationMs: number | null;
};

export type ExternalHttpActivityListener = (
  provider: string,
  activity: ExternalHttpActivity,
) => void;
