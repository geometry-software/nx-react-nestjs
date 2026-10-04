import { DataFlowView } from '../components/data-flow-view';
import { useDataFlowPage } from './data-flow.page.ts';

export function DataFlow() {
  const model = useDataFlowPage();
  return <DataFlowView translate={model.translate} />;
}
