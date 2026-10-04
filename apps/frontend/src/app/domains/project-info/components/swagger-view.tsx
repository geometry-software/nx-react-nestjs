import { BookOpen } from 'lucide-react';
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
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen />
        </span>
        <ProjectInfoHeader title={translate('info.swaggerTab')} />
      </div>
      <SwaggerDocuments documents={documents} translate={translate} />
    </div>
  );
}
