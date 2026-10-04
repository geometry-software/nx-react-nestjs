import type { EntityWriteResponse, Page } from '@/app/models/api.model';
import type { Invoice, InvoiceInput } from '../models/invoices.model';
import { dataService } from '@/app/services/data.service';
import { invoicesApi } from '@/app/api/invoices.api';
import {
  addEntityToFirstPage,
  replaceEntityInPage,
} from '@/app/utils/rtk-query-cache';
import { handleQueryFulfilled } from '@/app/utils/rtk-query-lifecycle';

const { apiService } = dataService;

export const invoicesService = apiService.api.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<Page<Invoice>, string>({
      query: (query) => apiService.get(invoicesApi.list(query)),
    }),
    getInvoiceById: builder.query<Invoice, string>({
      query: (id) => apiService.get(invoicesApi.byId(id)),
    }),
    createInvoice: builder.mutation<
      EntityWriteResponse<Invoice>,
      { body: InvoiceInput; cacheKey: string }
    >({
      query: ({ body }) => apiService.post(invoicesApi.create, body),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            invoicesService.util.updateQueryData(
              'getInvoices',
              cacheKey,
              (draft) => addEntityToFirstPage(draft, data),
            ),
          );
        });
      },
    }),
    updateInvoice: builder.mutation<
      EntityWriteResponse<Invoice>,
      {
        id: string;
        body: Pick<InvoiceInput, 'name' | 'description'>;
        cacheKey: string;
      }
    >({
      query: ({ id, body }) => apiService.put(invoicesApi.byId(id), body),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            invoicesService.util.updateQueryData('getInvoices', cacheKey, (draft) =>
              replaceEntityInPage(draft, data),
            ),
          );
        });
      },
    }),
    confirmInvoice: builder.mutation<
      Invoice,
      { id: string; cacheKey: string }
    >({
      query: ({ id }) => apiService.post(invoicesApi.confirm(id)),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            invoicesService.util.updateQueryData('getInvoices', cacheKey, (draft) =>
              replaceEntityInPage(draft, data),
            ),
          );
        });
      },
    }),
    cancelInvoice: builder.mutation<
      Invoice,
      { id: string; cacheKey: string }
    >({
      query: ({ id }) => apiService.post(invoicesApi.cancel(id)),
      async onQueryStarted({ cacheKey }, { dispatch, queryFulfilled }) {
        await handleQueryFulfilled(queryFulfilled, (data) => {
          dispatch(
            invoicesService.util.updateQueryData('getInvoices', cacheKey, (draft) =>
              replaceEntityInPage(draft, data),
            ),
          );
        });
      },
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useConfirmInvoiceMutation,
  useCancelInvoiceMutation,
} = invoicesService;

export function useInvoicesService(query: string, enabled = true) {
  const listQuery = useGetInvoicesQuery(query, {
    skip: !enabled,
    refetchOnMountOrArgChange: true,
  });
  const [updateMutation, updateState] = useUpdateInvoiceMutation();
  const [confirmMutation, confirmState] = useConfirmInvoiceMutation();
  const [cancelMutation, cancelState] = useCancelInvoiceMutation();

  return {
    listQuery,
    update: (args: Parameters<typeof updateMutation>[0]) =>
      updateMutation(args).unwrap(),
    confirm: (args: Parameters<typeof confirmMutation>[0]) =>
      confirmMutation(args).unwrap(),
    cancel: (args: Parameters<typeof cancelMutation>[0]) =>
      cancelMutation(args).unwrap(),
    isUpdating: updateState.isLoading,
    isConfirming: confirmState.isLoading,
    isCancelling: cancelState.isLoading,
  };
}
