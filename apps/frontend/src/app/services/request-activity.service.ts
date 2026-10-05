export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type RequestActivitySnapshot = {
  active: boolean;
  activeStartedAt: number | null;
  lastDuration: number;
  method: RequestMethod | null;
  visible: boolean;
};

type TrackedRequest = {
  method: RequestMethod;
  startedAt: number;
};

export class RequestActivityService {
  private readonly listeners = new Set<() => void>();
  private readonly startedRequests = new Map<string, TrackedRequest>();
  private requestSequence = 0;
  private snapshot: RequestActivitySnapshot = {
    active: false,
    activeStartedAt: null,
    lastDuration: 0,
    method: null,
    visible: false,
  };

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = () => this.snapshot;

  track(method: RequestMethod): () => void {
    const requestId = String(++this.requestSequence);
    const startedAt = performance.now();
    this.startedRequests.set(requestId, { method, startedAt });
    const activeRequest = this.getOldestRequest();

    this.publish({
      active: true,
      activeStartedAt: activeRequest?.startedAt ?? startedAt,
      method: activeRequest?.method ?? method,
      visible: true,
    });

    return () => {
      const completedAt = performance.now();
      const completedRequest = this.startedRequests.get(requestId);
      this.startedRequests.delete(requestId);
      const nextActiveRequest = this.getOldestRequest();

      this.publish({
        active: this.startedRequests.size > 0,
        activeStartedAt: nextActiveRequest?.startedAt ?? null,
        lastDuration: completedRequest
          ? Math.max(1, Math.round(completedAt - completedRequest.startedAt))
          : this.snapshot.lastDuration,
        method: nextActiveRequest?.method ?? completedRequest?.method ?? method,
        visible: true,
      });
    };
  }

  private publish(next: Partial<RequestActivitySnapshot>) {
    this.snapshot = { ...this.snapshot, ...next };
    this.listeners.forEach((listener) => listener());
  }

  private getOldestRequest(): TrackedRequest | null {
    return [...this.startedRequests.values()].reduce<TrackedRequest | null>(
      (oldest, request) =>
        !oldest || request.startedAt < oldest.startedAt ? request : oldest,
      null,
    );
  }
}
