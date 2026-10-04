import {
  type DataFlowPageModel,
  DataFlowPageModelInstance,
} from '../models/data-flow.page.model';
import { useProjectInfoFeature } from '../feature/project-info.feature';

export function useDataFlowPage(): DataFlowPageModel {
  return new DataFlowPageModelInstance(useProjectInfoFeature());
}
