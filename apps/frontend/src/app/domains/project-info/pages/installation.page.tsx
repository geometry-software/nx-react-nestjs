import { InstallationView } from '../components/installation-view';
import { useInstallationPage } from './installation.page.ts';

export function Installation() {
  const model = useInstallationPage();
  return <InstallationView translate={model.translate} />;
}
