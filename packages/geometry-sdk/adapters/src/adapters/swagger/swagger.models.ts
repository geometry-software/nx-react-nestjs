export type SwaggerServiceDefinition<TName extends string = string> = {
  name: TName;
  port: number;
  documentationPath?: string;
};

export type SwaggerDocument<TName extends string = string> = {
  name: TName;
  url: string;
};
