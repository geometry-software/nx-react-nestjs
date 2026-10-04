import { ValidationPipe, type INestApplication } from "@nestjs/common";

export type ConfigurationReader = {
  get<TValue>(key: string): TValue | undefined;
  getOrThrow<TValue>(key: string): TValue;
};

type CacheControlResponse = {
  setHeader(name: string, value: string): void;
};

type ExpressApplication = {
  disable(setting: string): void;
};

export function configureNestApplication(
  app: INestApplication,
  corsOptions?: Parameters<INestApplication["enableCors"]>[0],
): void {
  app.setGlobalPrefix("api");
  app.enableCors(corsOptions);
  disableConditionalResponses(app);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}

function disableConditionalResponses(app: INestApplication): void {
  const expressApplication = app
    .getHttpAdapter()
    .getInstance() as ExpressApplication;

  expressApplication.disable("etag");
  app.use(
    (
      _request: unknown,
      response: CacheControlResponse,
      next: () => void,
    ) => {
      response.setHeader("Cache-Control", "no-store");
      next();
    },
  );
}

export function createMongoTypeOrmOptions(
  config: ConfigurationReader,
  connectionKey: string,
) {
  return {
    type: "mongodb" as const,
    url: config.getOrThrow<string>(connectionKey),
    autoLoadEntities: true,
    synchronize: config.get<string>("NODE_ENV") !== "production",
  };
}

export function readPort(value: string | undefined, fallback: number): number {
  const port = Number(value ?? fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid port: ${value ?? fallback}`);
  }
  return port;
}
