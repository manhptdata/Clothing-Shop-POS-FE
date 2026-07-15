import { baseApi } from './baseApi';
import type { Order, OrderRequest, ReturnOrder, ReturnOrderRequest } from '@/types/order.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/types/common.types';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<RestResponse<PageResponse<Order>>, PaginationParams & { status?: string; warehouseId?: number; search?: string }>({
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
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, { type: 'Statistic', id: 'LIST' }, { type: 'Product' }, { type: 'StockLog' }, { type: 'Customer' }],
    }),
    cancelOrder: builder.mutation<RestResponse<Order>, number>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Order', id }, { type: 'Order', id: 'LIST' }, { type: 'Product' }, { type: 'StockLog' }, { type: 'Statistic', id: 'LIST' }, { type: 'Customer' }],
    }),
    updateOrder: builder.mutation<RestResponse<Order>, { id: number; data: OrderRequest }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Statistic', id: 'LIST' },
      ],
    }),
    getReturnOrders: builder.query<RestResponse<PageResponse<ReturnOrder>>, PaginationParams & { search?: string }>({
      query: (params) => ({
        url: '/returns',
        method: 'GET',
        params,
      }),
      providesTags: (result) => {
        const list = (result?.data as any)?.result || (result?.data as any)?.content;
        return list && Array.isArray(list)
          ? [
            ...list.map(({ id }) => ({ type: 'ReturnOrder' as const, id })),
            { type: 'ReturnOrder', id: 'LIST' },
          ]
          : [{ type: 'ReturnOrder', id: 'LIST' }];
      }
    }),
    getReturnOrdersByOriginalOrderId: builder.query<RestResponse<ReturnOrder[]>, number>({
      query: (orderId) => ({
        url: `/returns/order/${orderId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, orderId) => [{ type: 'ReturnOrder', id: `ORDER_${orderId}` }],
    }),
    createReturnOrder: builder.mutation<RestResponse<ReturnOrder>, ReturnOrderRequest>({
      query: (data) => ({
        url: '/returns',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, data) => [
        { type: 'Order', id: data.originalOrderId },
        { type: 'Order', id: 'LIST' },
        { type: 'ReturnOrder', id: 'LIST' },
        { type: 'ReturnOrder', id: `ORDER_${data.originalOrderId}` },
        { type: 'Statistic', id: 'LIST' },
        { type: 'Product' },
        { type: 'StockLog' },
        { type: 'Customer' }
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
  useUpdateOrderMutation,
  useGetReturnOrdersQuery,
  useGetReturnOrdersByOriginalOrderIdQuery,
  useCreateReturnOrderMutation,
} = orderApi;
