import {
  type SwaggerPageModel,
  SwaggerPageModelInstance,
} from '../models/swagger.page.model';
import { useProjectInfoFeature } from '../feature/project-info.feature';

export function useSwaggerPage(): SwaggerPageModel {
  return new SwaggerPageModelInstance(useProjectInfoFeature());
}
