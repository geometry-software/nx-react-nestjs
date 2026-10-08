import { afterEach, describe, expect, it, vi } from 'vitest';
import { AxiosExternalHttpClient } from '../src/adapters/http/implementations/axios-external-http.client.js';
import { FetchAdapter } from '../src/adapters/http/implementations/fetch.adapter.js';

afterEach(() => vi.unstubAllGlobals());

const adapters = [
  { name: 'FetchAdapter', create: () => new FetchAdapter({ baseUrl: 'https://example.com' }) },
  { name: 'AxiosExternalHttpClient', create: () => new AxiosExternalHttpClient({ baseUrl: 'https://example.com' }) },
];

function stubSuccessfulRequest(adapter: FetchAdapter | AxiosExternalHttpClient) {
  if (adapter instanceof FetchAdapter) {
    const request = vi.fn().mockImplementation(async () => new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', request);
    return request;
  }
  const client = (adapter as unknown as { client: { request: (request: unknown) => Promise<unknown> } }).client;
  return vi.spyOn(client, 'request').mockResolvedValue({ data: { ok: true } });
}

describe.each(adapters)('$name public methods', ({ create }) => {
  it('execute returns the decoded response and sends one request', async () => {
    const adapter = create();
    const request = stubSuccessfulRequest(adapter);
    await expect(adapter.execute({ service: 'products', url: '/items', retry: false })).resolves.toEqual({ ok: true });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('getActivity reports completed requests with no in-flight work', async () => {
    const adapter = create();
    stubSuccessfulRequest(adapter);
    await adapter.execute({ service: 'products', url: '/items', retry: false });
    expect(adapter.getActivity('products')).toMatchObject({ active: false, inFlight: 0 });
    expect(adapter.getActivity().lastDurationMs).not.toBeNull();
  });

  it('subscribe receives activity changes and unsubscribe stops them', async () => {
    const adapter = create();
    stubSuccessfulRequest(adapter);
    const listener = vi.fn();
    const unsubscribe = adapter.subscribe(listener);
    await adapter.execute({ service: 'products', url: '/items', retry: false });
    expect(listener).toHaveBeenCalledWith('products', expect.objectContaining({ active: true, inFlight: 1 }));
    expect(listener).toHaveBeenCalledWith('products', expect.objectContaining({ active: false, inFlight: 0 }));
    unsubscribe();
    listener.mockClear();
    await adapter.execute({ service: 'products', url: '/items', retry: false });
    expect(listener).not.toHaveBeenCalled();
  });
});
