import { DataFlowView } from '../components/data-flow-view';
import { getDataFlowFeature } from '../feature/project-info.feature';

export function DataFlow() {
  const feature = getDataFlowFeature();
  return <DataFlowView translate={feature.translate} />;
}
