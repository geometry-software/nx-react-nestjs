import type { Translate } from '@/app/locales/locale';
import { InstallationCommand, InstallationLink, InstallationStep } from './installation-step';

const NODE_URL = 'https://nodejs.org/en/download';
const REPOSITORY_URL = 'https://github.com/geometry-software/nx-react-nestjs';

export function InstallationSteps({ translate }: { translate: Translate }) {
  return (
    <div className="grid gap-5">
      <InstallationStep
        number="01"
        title={translate('installation.stepNode')}
        description={translate('installation.stepNodeText')}
      >
        <InstallationLink href={NODE_URL} />
      </InstallationStep>
      <InstallationStep
        number="02"
        title={translate('installation.stepClone')}
        description={translate('installation.stepCloneText')}
      >
        <InstallationLink href={REPOSITORY_URL} />
      </InstallationStep>
      <InstallationStep
        number="03"
        title={translate('installation.stepStartAll')}
        description={translate('installation.stepStartAllText')}
      >
        <InstallationCommand>npm start</InstallationCommand>
      </InstallationStep>
    </div>
  );
}
