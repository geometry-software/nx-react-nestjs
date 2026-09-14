export type ServiceName =
  | 'auth'
  | 'products'
  | 'users'
  | 'shipping'
  | 'invoices';

declare const __SERVICE_PORTS__: Readonly<Record<ServiceName, number>>;

export function getServiceOrigin(service: ServiceName): string {
  const origin = new URL(window.location.origin);
  origin.port = String(__SERVICE_PORTS__[service]);
  return origin.origin;
}

export function getServiceUrl(service: ServiceName, path: string): string {
  return new URL(path, `${getServiceOrigin(service)}/`).toString();
}
