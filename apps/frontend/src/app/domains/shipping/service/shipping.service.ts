import type {
  BulkDeleteResponse,
  DeleteResponse,
  EntityWriteResponse,
  Page,
} from '@/app/models/api.model';
import type {
  CityLocation,
  CountryLocation,
  Shipment,
  ShipmentInput,
} from '../models/shipping.model';
import { getDataService } from '@/app/services/data.service';
import { shippingApi, type CitiesApiQuery } from '@/app/api/shipping.api';
import {
  addEntityToFirstPage,
  removeEntityFromPage,
  replaceEntityInPage,
} from '@/app/utils/rtk-query-cache';
import { handleQueryFulfilled } from '@/app/utils/rtk-query-lifecycle';
import {
  confirmedInvoicesListQuery,
} from '@/app/api/invoices.api';
import { usersPickerListQuery } from '@/app/api/users.api';
import { useGetInvoicesQuery } from '../../invoices/service/invoices.service';
import { useGetUsersQuery } from '../../users/service/users.service';

const { apiService } = getDataService();

export const shippingService = apiService.api.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<CountryLocation[], void>({
      query: () => apiService.get(shippingApi.countries),
    }),
    getCities: builder.query<CityLocation[], CitiesApiQuery>({
      query: (query) => apiService.get(shippingApi.cities(query)),
    }),
    getShipments: builder.query<Page<Shipment>, string>({
      query: (query) => apiService.get(shippingApi.list(query)),
    }),
    getShipmentById: builder.query<Shipment, string>({
      query: (id) => apiService.get(shippingApi.byId(id)),
    }),
    createShipment: builder.mutation<
      EntityWriteResponse<Shipment>,
      { body: ShipmentInput; cacheKey: string }
    >({
      query: ({ body }) => apiService.post(shippingApi.create, body),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            shippingService.util.updateQueryData(
              'getShipments',
              cacheKey,
              (draft) => addEntityToFirstPage(draft, data),
            ),
          );
        });
      },
    }),
    updateShipment: builder.mutation<
      EntityWriteResponse<Shipment>,
      { id: string; body: Partial<Shipment>; cacheKey: string }
    >({
      query: ({ id, body }) => apiService.put(shippingApi.byId(id), body),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            shippingService.util.updateQueryData(
              'getShipments',
              cacheKey,
              (draft) => replaceEntityInPage(draft, data),
            ),
          );
        });
      },
    }),
    refreshShipmentTracking: builder.mutation<
      Shipment,
      { id: string; cacheKey: string }
    >({
      query: ({ id }) => apiService.post(shippingApi.refreshTracking(id)),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            shippingService.util.updateQueryData(
              'getShipments',
              cacheKey,
              (draft) => replaceEntityInPage(draft, data),
            ),
          );
        });
      },
    }),
    deleteShipment: builder.mutation<
      DeleteResponse,
      { id: string; cacheKey: string }
    >({
      query: ({ id }) => apiService.delete(shippingApi.byId(id)),
      async onQueryStarted({ id, cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, () => {
          dispatch(
            shippingService.util.updateQueryData(
              'getShipments',
              cacheKey,
              (draft) => removeEntityFromPage(draft, id),
            ),
          );
        });
      },
    }),
    deleteShipments: builder.mutation<
      BulkDeleteResponse,
      { ids: string[]; cacheKey: string }
    >({
      query: ({ ids }) => apiService.delete(shippingApi.bulkDelete, { ids }),
      async onQueryStarted({ ids, cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, () => {
          dispatch(
            shippingService.util.updateQueryData(
              'getShipments',
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
  useGetCountriesQuery,
  useGetCitiesQuery,
  useGetShipmentsQuery,
  useGetShipmentByIdQuery,
  useCreateShipmentMutation,
  useUpdateShipmentMutation,
  useRefreshShipmentTrackingMutation,
  useDeleteShipmentMutation,
  useDeleteShipmentsMutation,
} = shippingService;

export function useShippingService({
  citySearch,
  country,
  enabled,
  query,
}: {
  citySearch: string;
  country: string;
  enabled: boolean;
  query: string;
}) {
  const listQuery = useGetShipmentsQuery(query, {
    skip: !enabled,
    refetchOnMountOrArgChange: true,
  });
  const invoicesQuery = useGetInvoicesQuery(confirmedInvoicesListQuery);
  const usersQuery = useGetUsersQuery(usersPickerListQuery);
  const countriesQuery = useGetCountriesQuery();
  const citiesQuery = useGetCitiesQuery(
    { country, search: citySearch },
    { skip: !country },
  );
  const [createMutation, createState] = useCreateShipmentMutation();
  const [removeMutation, removeState] = useDeleteShipmentMutation();
  const [removeManyMutation, removeManyState] = useDeleteShipmentsMutation();
  const [refreshTrackingMutation, refreshTrackingState] =
    useRefreshShipmentTrackingMutation();

  return {
    listQuery,
    invoicesQuery,
    usersQuery,
    countriesQuery,
    citiesQuery,
    create: (args: Parameters<typeof createMutation>[0]) =>
      createMutation(args).unwrap(),
    remove: (args: Parameters<typeof removeMutation>[0]) =>
      removeMutation(args).unwrap(),
    removeMany: (args: Parameters<typeof removeManyMutation>[0]) =>
      removeManyMutation(args).unwrap(),
    refreshTracking: (args: Parameters<typeof refreshTrackingMutation>[0]) =>
      refreshTrackingMutation(args).unwrap(),
    isCreating: createState.isLoading,
    isDeleting: removeState.isLoading,
    isBulkDeleting: removeManyState.isLoading,
    isRefreshing: refreshTrackingState.isLoading,
  };
}
