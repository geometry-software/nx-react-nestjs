import { InstallationView } from '../components/installation-view';
import { getInstallationFeature } from '../feature/project-info.feature';

export function Installation() {
  const feature = getInstallationFeature();
  return <InstallationView translate={feature.translate} />;
}
