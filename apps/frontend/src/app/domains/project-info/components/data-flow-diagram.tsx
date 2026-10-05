import { DataFlowDiagram } from './runtime-data-flow-diagram';
import type { Translate } from '@/app/locales/locale';

export function ProjectDataFlowDiagram({ translate }: { translate: Translate }) {
  return (
    <DataFlowDiagram
      label={translate('info.diagramLabel')}
      workspaceTitle={translate('info.monorepoTitle')}
      workspaceDescription={translate('info.monorepoText')}
      frontendTitle={translate('info.frontend')}
      frontendDescription={translate('info.frontendText')}
      frontendModules={[
        { title: translate('nav.products'), description: translate('info.productsModuleText') },
        { title: translate('nav.invoices'), description: translate('info.invoicesModuleText') },
        { title: translate('nav.shipping'), description: translate('info.shippingModuleText') },
        { title: translate('nav.auth'), description: translate('info.authorizationModuleText') },
      ]}
      transportLabel={translate('info.requestLayer')}
      backendTitle="NestJS"
      backendDescription={translate('info.backendText')}
      authorizationServices={[
        { title: translate('info.authService'), description: translate('info.authorizationServiceText'), port: ':3001' },
      ]}
      services={[
        { title: translate('info.productsService'), description: translate('info.productsServiceText'), port: ':3002' },
        { title: translate('info.invoicesService'), description: translate('info.invoicesServiceText'), port: ':3005' },
        { title: translate('info.shippingService'), description: translate('info.shippingServiceText'), port: ':3004' },
      ]}
      persistenceTitle="TypeORM"
      persistenceDescription={translate('info.persistenceText')}
      database={{ title: translate('info.database'), description: translate('info.databaseText') }}
      externalTitle="Axios"
      externalDescription={translate('info.externalApiText')}
      externalApis={[
        { title: 'countries.dev', description: translate('info.countriesDevText') },
        { title: 'Dummy Package Place Service', description: translate('info.dummyPackagePlaceText') },
      ]}
    />
  );
}
