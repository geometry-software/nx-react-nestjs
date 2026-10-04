import {
  type InstallationPageModel,
  InstallationPageModelInstance,
} from '../models/installation.page.model';
import { useProjectInfoFeature } from '../feature/project-info.feature';

export function useInstallationPage(): InstallationPageModel {
  return new InstallationPageModelInstance(useProjectInfoFeature());
}
