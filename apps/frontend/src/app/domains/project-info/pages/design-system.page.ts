import {
  type DesignSystemPageModel,
  DesignSystemPageModelInstance,
} from '../models/design-system.page.model';
import { useProjectInfoFeature } from '../feature/project-info.feature';

export function useDesignSystemPage(): DesignSystemPageModel {
  return new DesignSystemPageModelInstance(useProjectInfoFeature());
}
