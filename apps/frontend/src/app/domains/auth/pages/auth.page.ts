import { useAuthFeature } from '../feature/auth.feature';
import {
  type AuthPageModel,
  AuthPageModelInstance,
} from '../models/auth.page.model';

export function useAuthPage(): AuthPageModel {
  return new AuthPageModelInstance(useAuthFeature());
}
