import type {
  BulkDeleteResponse,
  DeleteResponse,
  EntityWriteResponse,
  Page,
} from '@/app/models/api.model';
import type { Product } from '../models/products.model';
import { getDataService } from '@/app/services/data.service';
import { productsApi } from '@/app/api/products.api';
import {
  addEntityToFirstPage,
  removeEntityFromPage,
  replaceEntityInPage,
} from '@/app/utils/rtk-query-cache';
import { handleQueryFulfilled } from '@/app/utils/rtk-query-lifecycle';

const { apiService } = getDataService();

export const productsService = apiService.api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Page<Product>, string>({
      query: (query) => apiService.get(productsApi.list(query)),
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => apiService.get(productsApi.byId(id)),
    }),
    createProduct: builder.mutation<
      EntityWriteResponse<Product>,
      { body: Partial<Product>; cacheKey: string }
    >({
      query: ({ body }) => apiService.post(productsApi.create, body),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            productsService.util.updateQueryData(
              'getProducts',
              cacheKey,
              (draft) => addEntityToFirstPage(draft, data),
            ),
          );
        });
      },
    }),
    updateProduct: builder.mutation<
      EntityWriteResponse<Product>,
      { id: string; body: Partial<Product>; cacheKey: string }
    >({
      query: ({ id, body }) => apiService.put(productsApi.byId(id), body),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            productsService.util.updateQueryData(
              'getProducts',
              cacheKey,
              (draft) => replaceEntityInPage(draft, data),
            ),
          );
        });
      },
    }),
    deleteProduct: builder.mutation<
      DeleteResponse,
      { id: string; cacheKey: string }
    >({
      query: ({ id }) => apiService.delete(productsApi.byId(id)),
      async onQueryStarted({ id, cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, () => {
          dispatch(
            productsService.util.updateQueryData(
              'getProducts',
              cacheKey,
              (draft) => removeEntityFromPage(draft, id),
            ),
          );
        });
      },
    }),
    deleteProducts: builder.mutation<
      BulkDeleteResponse,
      { ids: string[]; cacheKey: string }
    >({
      query: ({ ids }) => apiService.delete(productsApi.bulkDelete, { ids }),
      async onQueryStarted({ ids, cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, () => {
          dispatch(
            productsService.util.updateQueryData(
              'getProducts',
              cacheKey,
              (draft) => ids.forEach((id) => removeEntityFromPage(draft, id)),
            ),
          );
        });
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteProductsMutation,
} = productsService;

export function useProductsService(query: string, enabled = true) {
  const listQuery = useGetProductsQuery(query, {
    skip: !enabled,
    refetchOnMountOrArgChange: true,
  });
  const [createMutation, createState] = useCreateProductMutation();
  const [updateMutation, updateState] = useUpdateProductMutation();
  const [removeMutation, removeState] = useDeleteProductMutation();
  const [removeManyMutation, removeManyState] = useDeleteProductsMutation();

  return {
    listQuery,
    create: (args: Parameters<typeof createMutation>[0]) =>
      createMutation(args).unwrap(),
    update: (args: Parameters<typeof updateMutation>[0]) =>
      updateMutation(args).unwrap(),
    remove: (args: Parameters<typeof removeMutation>[0]) =>
      removeMutation(args).unwrap(),
    removeMany: (args: Parameters<typeof removeManyMutation>[0]) =>
      removeManyMutation(args).unwrap(),
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: removeState.isLoading,
    isBulkDeleting: removeManyState.isLoading,
  };
}
