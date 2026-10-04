import type { Translate } from '@/app/locales/locale';
import type { useProjectInfoFeature } from '../feature/project-info.feature';

type DataFlowFeature = ReturnType<typeof useProjectInfoFeature>;

export interface DataFlowPageModel {
  readonly translate: Translate;
}

export class DataFlowPageModelInstance implements DataFlowPageModel {
  public constructor(private readonly feature: DataFlowFeature) {}

  public get translate() { return this.feature.translate; }
}
