import type {
  BulkDeleteResponse,
  DeleteResponse,
  EntityWriteResponse,
  Page,
} from '@/app/models/api.model';
import type { User } from '../models/users.model';
import { getDataService } from '@/app/services/data.service';
import { usersApi } from '@/app/api/users.api';
import {
  removeEntityFromPage,
  replaceEntityInPage,
} from '@/app/utils/rtk-query-cache';
import { handleQueryFulfilled } from '@/app/utils/rtk-query-lifecycle';

const { apiService } = getDataService();

export const usersService = apiService.api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<Page<User>, string>({
      query: (query) => apiService.get(usersApi.list(query)),
    }),
    getUserById: builder.query<User, string>({
      query: (id) => apiService.get(usersApi.byId(id)),
    }),
    updateUser: builder.mutation<
      EntityWriteResponse<User>,
      { id: string; body: Partial<User>; cacheKey: string }
    >({
      query: ({ id, body }) => apiService.put(usersApi.byId(id), body),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            usersService.util.updateQueryData('getUsers', cacheKey, (draft) =>
              replaceEntityInPage(draft, data),
            ),
          );
        });
      },
    }),
    deleteUser: builder.mutation<
      DeleteResponse,
      { id: string; cacheKey: string }
    >({
      query: ({ id }) => apiService.delete(usersApi.byId(id)),
      async onQueryStarted({ id, cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, () => {
          dispatch(
            usersService.util.updateQueryData('getUsers', cacheKey, (draft) =>
              removeEntityFromPage(draft, id),
            ),
          );
        });
      },
    }),
    deleteUsers: builder.mutation<
      BulkDeleteResponse,
      { ids: string[]; cacheKey: string }
    >({
      query: ({ ids }) => apiService.delete(usersApi.bulkDelete, { ids }),
      async onQueryStarted({ ids, cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, () => {
          dispatch(
            usersService.util.updateQueryData('getUsers', cacheKey, (draft) =>
              ids.forEach((id) => removeEntityFromPage(draft, id)),
            ),
          );
        });
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useDeleteUsersMutation,
} = usersService;

export function useUsersService(query: string, enabled = true) {
  const listQuery = useGetUsersQuery(query, {
    skip: !enabled,
    refetchOnMountOrArgChange: true,
  });
  const [updateMutation, updateState] = useUpdateUserMutation();
  const [removeMutation, removeState] = useDeleteUserMutation();
  const [removeManyMutation, removeManyState] = useDeleteUsersMutation();

  return {
    listQuery,
    update: (args: Parameters<typeof updateMutation>[0]) =>
      updateMutation(args).unwrap(),
    remove: (args: Parameters<typeof removeMutation>[0]) =>
      removeMutation(args).unwrap(),
    removeMany: (args: Parameters<typeof removeManyMutation>[0]) =>
      removeManyMutation(args).unwrap(),
    isUpdating: updateState.isLoading,
    isDeleting: removeState.isLoading,
    isBulkDeleting: removeManyState.isLoading,
  };
}
