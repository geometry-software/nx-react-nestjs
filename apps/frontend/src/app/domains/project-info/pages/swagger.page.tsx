import { SwaggerView } from '../components/swagger-view';
import { getSwaggerFeature } from '../feature/project-info.feature';

export function Swagger() {
  const feature = getSwaggerFeature();
  return (
    <SwaggerView
      documents={feature.documents}
      translate={feature.translate}
    />
  );
}
