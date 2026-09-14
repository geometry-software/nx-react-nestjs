import { BookOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@nx-react-nestjs/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nx-react-nestjs/components/ui/tabs';
import { useI18n } from '../app/i18n';
import { getServiceUrl, type ServiceName } from '../services/service-location';

export function ProjectInfo() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen />
          </span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {t('info.swaggerTab')}
            </h1>
          </div>
        </div>
      </header>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('info.swaggerTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auth">
            <TabsList className="mb-4 flex-wrap">
              <TabsTrigger value="auth">{t('info.swaggerAuth')}</TabsTrigger>
              <TabsTrigger value="products">
                {t('info.swaggerProducts')}
              </TabsTrigger>
              <TabsTrigger value="users">{t('info.swaggerUsers')}</TabsTrigger>
              <TabsTrigger value="shipping">
                {t('info.swaggerShipping')}
              </TabsTrigger>
              <TabsTrigger value="invoices">
                {t('info.swaggerInvoices')}
              </TabsTrigger>
            </TabsList>
            <SwaggerFrame service="auth" title={t('info.swaggerAuth')} />
            <SwaggerFrame
              service="products"
              title={t('info.swaggerProducts')}
            />
            <SwaggerFrame service="users" title={t('info.swaggerUsers')} />
            <SwaggerFrame
              service="shipping"
              title={t('info.swaggerShipping')}
            />
            <SwaggerFrame
              service="invoices"
              title={t('info.swaggerInvoices')}
            />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SwaggerFrame({
  service,
  title,
}: {
  service: ServiceName;
  title: string;
}) {
  return (
    <TabsContent value={service}>
      <iframe
        className="h-[min(72vh,760px)] w-full rounded-lg border bg-background"
        src={getServiceUrl(service, '/docs')}
        title={`${title} Swagger UI`}
      />
    </TabsContent>
  );
}
