import type { Translate } from '@/app/locales/locale';
import type { useProjectInfoFeature } from '../feature/project-info.feature';

type InstallationFeature = ReturnType<typeof useProjectInfoFeature>;

export interface InstallationPageModel {
  readonly translate: Translate;
}

export class InstallationPageModelInstance implements InstallationPageModel {
  public constructor(private readonly feature: InstallationFeature) {}

  public get translate() { return this.feature.translate; }
}
