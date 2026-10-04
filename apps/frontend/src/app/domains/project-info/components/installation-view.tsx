import type { Translate } from '@/app/locales/locale';
import { InstallationSteps } from './installation-steps';
import { ProjectInfoHeader } from './project-info-header';

export function InstallationView({ translate }: { translate: Translate }) {
  return (
    <div className="space-y-8">
      <ProjectInfoHeader
        eyebrow={translate('installation.eyebrow')}
        title={translate('installation.title')}
        description={translate('installation.subtitle')}
      />
      <InstallationSteps translate={translate} />
    </div>
  );
}
