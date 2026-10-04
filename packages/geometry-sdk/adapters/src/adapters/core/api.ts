export type ApiServiceName =
  | "auth"
  | "comparisons"
  | "dataSources";

export type ApiServiceKind =
  | "authentication"
  | "data-source"
  | "orchestrator";

export type ApiNetwork = Readonly<{
  protocol: "inherit" | "http" | "https";
  hostname: "current" | string;
  port: number;
  basePath: `/${string}`;
  path?: `/${string}`;
}>;

export type ApiEndpointMetadata = Readonly<{
  service: ApiServiceName;
  label: string;
  kind: ApiServiceKind;
  version: string;
  resource?: string;
}>;

export type ApiEndpoint = Readonly<{
  network: ApiNetwork;
  metadata: ApiEndpointMetadata;
}>;

export type ServiceEndpointMap = Readonly<Record<ApiServiceName, ApiEndpoint>>;

export type ApiResponseContainer<TData> = Readonly<{
  endpoint: ApiEndpoint;
  data: TData;
}>;

export function createApiResponseContainer<TData>(
  endpoint: ApiEndpoint,
  data: TData,
): ApiResponseContainer<TData> {
  return { endpoint, data };
}
