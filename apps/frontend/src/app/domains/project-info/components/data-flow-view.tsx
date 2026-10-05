import type { Translate } from '@/app/locales/locale';
import { ProjectDataFlowDiagram } from './data-flow-diagram';
import { ProjectInfoHeader } from './project-info-header';

export function DataFlowView({ translate }: { translate: Translate }) {
  return (
    <div className="space-y-8">
      <ProjectInfoHeader title={translate('info.title')} description={translate('info.subtitle')} />
      <ProjectDataFlowDiagram translate={translate} />
    </div>
  );
}
