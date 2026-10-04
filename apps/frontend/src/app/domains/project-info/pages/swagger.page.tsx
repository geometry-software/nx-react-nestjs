import { SwaggerView } from '../components/swagger-view';
import { useSwaggerPage } from './swagger.page.ts';

export function Swagger() {
  const model = useSwaggerPage();
  return (
    <SwaggerView
      documents={model.documents}
      translate={model.translate}
    />
  );
}
