import type { Translate } from '@/app/locales/locale';
import type { SwaggerDocument } from '../models/project-info.model';
import { ProjectInfoHeader } from './project-info-header';
import { SwaggerDocuments } from './swagger-documents';

export function SwaggerView({
  documents,
  translate,
}: {
  documents: SwaggerDocument[];
  translate: Translate;
}) {
  return (
    <div className="space-y-6">
      <ProjectInfoHeader title={translate('info.swaggerTab')} />
      <SwaggerDocuments documents={documents} translate={translate} />
    </div>
  );
}
