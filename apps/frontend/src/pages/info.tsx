import { DataFlowDiagram } from '@nx-react-nestjs/components/app/data-flow-diagram';
import { Badge } from '@nx-react-nestjs/components/ui/badge';
import { useI18n } from '../app/i18n';

export function Info() {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <header>
        <Badge variant="secondary">{t('info.eyebrow')}</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          {t('info.title')}
        </h1>
        <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
          {t('info.subtitle')}
        </p>
      </header>
      <DataFlowDiagram
            label={t('info.diagramLabel')}
            workspaceTitle={t('info.monorepoTitle')}
            workspaceDescription={t('info.monorepoText')}
            frontendTitle={t('info.frontend')}
            frontendDescription={t('info.frontendText')}
            frontendModules={[
              { title: t('nav.products'), description: t('info.productsModuleText') },
              { title: t('nav.invoices'), description: t('info.invoicesModuleText') },
              { title: t('nav.shipping'), description: t('info.shippingModuleText') },
              { title: t('nav.auth'), description: t('info.authorizationModuleText') },
            ]}
            transportLabel={t('info.requestLayer')}
            backendTitle="NestJS"
            backendDescription={t('info.backendText')}
            authorizationServices={[
              {
                title: t('info.authService'),
                description: t('info.authServiceText'),
                port: ':3001',
              },
              {
                title: t('info.usersService'),
                description: t('info.usersServiceText'),
                port: ':3003',
              },
            ]}
            services={[
              { title: t('info.productsService'), description: t('info.productsServiceText'), port: ':3002' },
              { title: t('info.invoicesService'), description: t('info.invoicesServiceText'), port: ':3005' },
              { title: t('info.shippingService'), description: t('info.shippingServiceText'), port: ':3004' },
            ]}
            persistenceTitle="TypeORM"
            persistenceDescription={t('info.persistenceText')}
            database={{ title: t('info.database'), description: t('info.databaseText') }}
            externalTitle="Axios"
            externalDescription={t('info.externalApiText')}
            externalApis={[
              { title: 'countries.dev', description: t('info.countriesDevText') },
              {
                title: 'Dummy Package Place Service',
                description: t('info.dummyPackagePlaceText'),
              },
            ]}
      />
    </div>
  );
}
