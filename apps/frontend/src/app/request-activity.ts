import { isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { useEffect, useState, useSyncExternalStore } from 'react';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestActivitySnapshot = {
  active: boolean;
  activeStartedAt: number | null;
  lastDuration: number;
  method: RequestMethod | null;
  visible: boolean;
};

type TrackedRequest = { method: RequestMethod; startedAt: number };

const listeners = new Set<() => void>();
const startedRequests = new Map<string, TrackedRequest>();
let snapshot: RequestActivitySnapshot = {
  active: false,
  activeStartedAt: null,
  lastDuration: 0,
  method: null,
  visible: false,
};

function publish(next: Partial<RequestActivitySnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function isTrackedAction(
  action: unknown,
  reducerPaths: readonly string[],
): action is {
  type: string;
  meta: { requestId: string; arg?: { endpointName?: string; type?: string } };
} {
  if (typeof action !== 'object' || action === null) return false;
  const candidate = action as {
    type?: unknown;
    meta?: { requestId?: unknown };
  };
  const actionType = candidate.type;
  return (
    typeof actionType === 'string' &&
    typeof candidate.meta?.requestId === 'string' &&
    reducerPaths.some((path) => actionType.startsWith(`${path}/`))
  );
}

function getRequestMethod(action: {
  meta: { arg?: { endpointName?: string; type?: string } };
}): RequestMethod {
  if (action.meta.arg?.type === 'query') return 'GET';
  const endpoint = action.meta.arg?.endpointName?.toLowerCase() ?? '';
  if (endpoint.startsWith('create')) return 'POST';
  if (endpoint.startsWith('update')) return 'PUT';
  if (endpoint.startsWith('delete')) return 'DELETE';
  if (
    endpoint.startsWith('refresh') ||
    endpoint.startsWith('confirm') ||
    endpoint.startsWith('cancel')
  )
    return 'POST';
  return 'GET';
}

function getOldestRequest(): TrackedRequest | null {
  return [...startedRequests.values()].reduce<TrackedRequest | null>(
    (oldest, request) =>
      !oldest || request.startedAt < oldest.startedAt ? request : oldest,
    null,
  );
}

export function createRequestActivityMiddleware(
  reducerPaths: readonly string[],
): Middleware {
  return () => (next) => (action) => {
    if (!isTrackedAction(action, reducerPaths)) return next(action);
    const now = performance.now();
    const { requestId } = action.meta;

    if (isPending(action)) {
      startedRequests.set(requestId, {
        method: getRequestMethod(action),
        startedAt: now,
      });
      const activeRequest = getOldestRequest();
      publish({
        active: true,
        activeStartedAt: activeRequest?.startedAt ?? now,
        method: activeRequest?.method ?? getRequestMethod(action),
        visible: true,
      });
    }

    const result = next(action);
    if (isFulfilled(action) || isRejected(action)) {
      const completedRequest = startedRequests.get(requestId);
      startedRequests.delete(requestId);
      const activeRequest = getOldestRequest();
      publish({
        active: startedRequests.size > 0,
        activeStartedAt: activeRequest?.startedAt ?? null,
        lastDuration:
          completedRequest === undefined
            ? snapshot.lastDuration
            : Math.max(1, Math.round(now - completedRequest.startedAt)),
        method:
          activeRequest?.method ??
          completedRequest?.method ??
          getRequestMethod(action),
        visible: true,
      });
    }
    return result;
  };
}

export function useRequestActivity() {
  const activity = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [duration, setDuration] = useState(activity.lastDuration);

  useEffect(() => {
    const startedAt = activity.activeStartedAt;
    if (!activity.active || startedAt === null) {
      setDuration(activity.lastDuration);
      return undefined;
    }
    const update = () =>
      setDuration(Math.max(1, Math.round(performance.now() - startedAt)));
    update();
    const interval = window.setInterval(update, 50);
    return () => window.clearInterval(interval);
  }, [activity.active, activity.activeStartedAt, activity.lastDuration]);

  return { ...activity, duration };
}
