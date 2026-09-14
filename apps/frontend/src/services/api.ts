import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BulkDeleteResponse,
  CityLocation,
  CountryLocation,
  DeleteResponse,
  Invoice,
  InvoiceInput,
  Page,
  Product,
  Shipment,
  ShipmentInput,
  User,
} from '../lib/types';
import {
  prependToFirstPage,
  removeFromPage,
  replaceInPage,
} from './cache-updates';
import { getServiceOrigin } from './service-location';

const productsUrl = getServiceOrigin('products');
const usersUrl = getServiceOrigin('users');
const authUrl = getServiceOrigin('auth');
const shippingUrl = getServiceOrigin('shipping');
const invoicesUrl = getServiceOrigin('invoices');
export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (b) => ({
    listProducts: b.query<Page<Product>, string>({
      query: (url) => url,
    }),
    createProduct: b.mutation<Product, { body: Partial<Product>; cacheKey: string }>({
      query: ({ body }) => ({
        url: `${productsUrl}/api/products`,
        method: 'POST',
        body,
      }),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data: product } = await queryFulfilled;
          dispatch(productsApi.util.updateQueryData('listProducts', cacheKey, (draft) => {
            prependToFirstPage(draft, product);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    updateProduct: b.mutation<Product, { id: string; body: Partial<Product>; cacheKey: string }>({
      query: ({ id, body }) => ({
        url: `${productsUrl}/api/products/${id}`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted({ id, cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data: product } = await queryFulfilled;
          dispatch(productsApi.util.updateQueryData('listProducts', cacheKey, (draft) => {
            replaceInPage(draft, product);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    deleteProduct: b.mutation<DeleteResponse, { id: string; cacheKey: string }>({
      query: ({ id }) => ({
        url: `${productsUrl}/api/products/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ id, cacheKey }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(productsApi.util.updateQueryData('listProducts', cacheKey, (draft) => {
            removeFromPage(draft, id);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    deleteProducts: b.mutation<
      BulkDeleteResponse,
      { ids: string[]; cacheKey: string }
    >({
      query: ({ ids }) => ({
        url: `${productsUrl}/api/products/bulk`,
        method: 'DELETE',
        body: { ids },
      }),
      async onQueryStarted({ ids, cacheKey }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            productsApi.util.updateQueryData(
              'listProducts',
              cacheKey,
              (draft) => {
                ids.forEach((id) => removeFromPage(draft, id));
              },
            ),
          );
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
  }),
});
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (b) => ({
    listUsers: b.query<Page<User>, string>({
      query: (url) => url,
    }),
    createUser: b.mutation<User, { body: Partial<User>; cacheKey: string }>({
      query: ({ body }) => ({ url: `${usersUrl}/api/users`, method: 'POST', body }),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled;
          dispatch(usersApi.util.updateQueryData('listUsers', cacheKey, (draft) => {
            prependToFirstPage(draft, user);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    updateUser: b.mutation<User, { id: string; body: Partial<User>; cacheKey: string }>({
      query: ({ id, body }) => ({
        url: `${usersUrl}/api/users/${id}`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted({ id, cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled;
          dispatch(usersApi.util.updateQueryData('listUsers', cacheKey, (draft) => {
            replaceInPage(draft, user);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    deleteUser: b.mutation<DeleteResponse, { id: string; cacheKey: string }>({
      query: ({ id }) => ({ url: `${usersUrl}/api/users/${id}`, method: 'DELETE' }),
      async onQueryStarted({ id, cacheKey }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(usersApi.util.updateQueryData('listUsers', cacheKey, (draft) => {
            removeFromPage(draft, id);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    deleteUsers: b.mutation<
      BulkDeleteResponse,
      { ids: string[]; cacheKey: string }
    >({
      query: ({ ids }) => ({
        url: `${usersUrl}/api/users/bulk`,
        method: 'DELETE',
        body: { ids },
      }),
      async onQueryStarted({ ids, cacheKey }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            usersApi.util.updateQueryData(
              'listUsers',
              cacheKey,
              (draft) => {
                ids.forEach((id) => removeFromPage(draft, id));
              },
            ),
          );
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
  }),
});
export const shippingApi = createApi({
  reducerPath: 'shippingApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (b) => ({
    listCountries: b.query<CountryLocation[], string>({
      query: (url) => url,
    }),
    listCities: b.query<CityLocation[], string>({
      query: (url) => url,
    }),
    listShipments: b.query<Page<Shipment>, string>({
      query: (url) => url,
    }),
    createShipment: b.mutation<
      Shipment,
      { body: ShipmentInput; cacheKey: string }
    >({
      query: ({ body }) => ({
        url: `${shippingUrl}/api/shippings`,
        method: 'POST',
        body,
      }),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            shippingApi.util.updateQueryData('listShipments', cacheKey, (draft) => {
              prependToFirstPage(draft, data);
            }),
          );
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    updateShipment: b.mutation<
      Shipment,
      { id: string; body: Partial<Shipment>; cacheKey: string }
    >({
      query: ({ id, body }) => ({
        url: `${shippingUrl}/api/shippings/${id}`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            shippingApi.util.updateQueryData('listShipments', cacheKey, (draft) => {
              replaceInPage(draft, data);
            }),
          );
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    refreshShipmentTracking: b.mutation<
      Shipment,
      { id: string; cacheKey: string }
    >({
      query: ({ id }) => ({
        url: `${shippingUrl}/api/shippings/${id}/tracking/refresh`,
        method: 'POST',
      }),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            shippingApi.util.updateQueryData('listShipments', cacheKey, (draft) => {
              replaceInPage(draft, data);
            }),
          );
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    deleteShipment: b.mutation<DeleteResponse, { id: string; cacheKey: string }>({
      query: ({ id }) => ({
        url: `${shippingUrl}/api/shippings/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ id, cacheKey }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            shippingApi.util.updateQueryData('listShipments', cacheKey, (draft) => {
              removeFromPage(draft, id);
            }),
          );
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    deleteShipments: b.mutation<
      BulkDeleteResponse,
      { ids: string[]; cacheKey: string }
    >({
      query: ({ ids }) => ({
        url: `${shippingUrl}/api/shippings/bulk`,
        method: 'DELETE',
        body: { ids },
      }),
      async onQueryStarted({ ids, cacheKey }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            shippingApi.util.updateQueryData('listShipments', cacheKey, (draft) => {
              ids.forEach((id) => removeFromPage(draft, id));
            }),
          );
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
  }),
});
export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (b) => ({
    listInvoices: b.query<Page<Invoice>, string>({ query: (url) => url }),
    createInvoice: b.mutation<Invoice, InvoiceInput>({
      query: (body) => ({
        url: `${invoicesUrl}/api/invoices`,
        method: 'POST',
        body,
      }),
    }),
    updateInvoice: b.mutation<
      Invoice,
      { id: string; body: Pick<InvoiceInput, 'name' | 'description'>; cacheKey: string }
    >({
      query: ({ id, body }) => ({
        url: `${invoicesUrl}/api/invoices/${id}`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(invoicesApi.util.updateQueryData('listInvoices', cacheKey, (draft) => {
            replaceInPage(draft, data);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    confirmInvoice: b.mutation<Invoice, { id: string; cacheKey: string }>({
      query: ({ id }) => ({
        url: `${invoicesUrl}/api/invoices/${id}/confirm`,
        method: 'POST',
      }),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(invoicesApi.util.updateQueryData('listInvoices', cacheKey, (draft) => {
            replaceInPage(draft, data);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
    cancelInvoice: b.mutation<Invoice, { id: string; cacheKey: string }>({
      query: ({ id }) => ({
        url: `${invoicesUrl}/api/invoices/${id}/cancel`,
        method: 'POST',
      }),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(invoicesApi.util.updateQueryData('listInvoices', cacheKey, (draft) => {
            replaceInPage(draft, data);
          }));
        } catch {
          // Keep the current cache unchanged when the mutation fails.
        }
      },
    }),
  }),
});
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${authUrl}/api/auth` }),
  endpoints: (b) => ({
    login: b.mutation<
      { accessToken: string },
      { email: string; password: string }
    >({ query: (body) => ({ url: '/login', method: 'POST', body }) }),
    register: b.mutation<
      { accessToken: string },
      { name: string; email: string; password: string }
    >({ query: (body) => ({ url: '/register', method: 'POST', body }) }),
  }),
});
export const {
  useListProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteProductsMutation,
} = productsApi;
export const {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useDeleteUsersMutation,
} = usersApi;
export const {
  useListCountriesQuery,
  useListCitiesQuery,
  useListShipmentsQuery,
  useCreateShipmentMutation,
  useUpdateShipmentMutation,
  useRefreshShipmentTrackingMutation,
  useDeleteShipmentMutation,
  useDeleteShipmentsMutation,
} = shippingApi;
export const {
  useListInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useConfirmInvoiceMutation,
  useCancelInvoiceMutation,
} = invoicesApi;
export const { useLoginMutation, useRegisterMutation } = authApi;
export { invoicesUrl, productsUrl, shippingUrl, usersUrl };
