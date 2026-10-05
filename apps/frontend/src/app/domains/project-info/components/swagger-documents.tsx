import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';
import type { SwaggerDocument } from '../models/project-info.model';

export function SwaggerDocuments({
  documents,
  translate,
}: {
  documents: SwaggerDocument[];
  translate: Translate;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{translate('info.swaggerTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login">
          <TabsList className="mb-4 flex-wrap">
            {documents.map((document) => (
              <TabsTrigger key={document.name} value={document.name}>
                {document.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {documents.map((document) => (
            <TabsContent key={document.name} value={document.name}>
              <iframe
                className="h-[min(72vh,760px)] w-full rounded-lg border bg-background"
                src={document.url}
                title={`${document.title} Swagger UI`}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
