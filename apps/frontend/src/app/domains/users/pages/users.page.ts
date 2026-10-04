import { useUsersFeature } from '../feature/users.feature';
import {
  type UsersPageModel,
  UsersPageModelInstance,
} from '../models/users.page.model';

export function useUsersPage(): UsersPageModel {
  return new UsersPageModelInstance(useUsersFeature());
}
