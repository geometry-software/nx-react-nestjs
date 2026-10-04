import type { Translate } from '@/app/locales/locale';
import type { useProjectInfoFeature } from '../feature/project-info.feature';
import type { SwaggerDocument } from './project-info.model';

type SwaggerFeature = ReturnType<typeof useProjectInfoFeature>;

export interface SwaggerPageModel {
  readonly documents: SwaggerDocument[];
  readonly translate: Translate;
}

export class SwaggerPageModelInstance implements SwaggerPageModel {
  public constructor(private readonly feature: SwaggerFeature) {}

  public get documents() { return this.feature.documents; }
  public get translate() { return this.feature.translate; }
}
