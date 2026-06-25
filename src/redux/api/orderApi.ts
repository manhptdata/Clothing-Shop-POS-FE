import { baseApi } from './baseApi';
import type { Order, OrderRequest } from '@/types/order.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/types/common.types';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<RestResponse<PageResponse<Order>>, PaginationParams & { status?: string; warehouseId?: number }>({
      query: (params) => ({
        url: '/orders',
        method: 'GET',
        params,
      }),
      providesTags: (result) => {
        const list = (result?.data as any)?.result || (result?.data as any)?.content;
        return list && Array.isArray(list)
          ? [
              ...list.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }];
      }
    }),
    getOrderById: builder.query<RestResponse<Order>, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<RestResponse<Order>, OrderRequest>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    cancelOrder: builder.mutation<RestResponse<Order>, number>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
} = orderApi;
