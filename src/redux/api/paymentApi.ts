import { baseApi } from './baseApi';
import type { PaymentLog } from '@/types/payment.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/types/common.types';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentLogs: builder.query<RestResponse<PageResponse<PaymentLog>>, PaginationParams & { orderNumber?: string; status?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/v1/payments/logs',
        method: 'GET',
        params: { 
          page: params.page, 
          size: params.size,
          orderNumber: params.orderNumber || undefined,
          status: params.status || undefined,
          startDate: params.startDate || undefined,
          endDate: params.endDate || undefined
        },
      }),
      providesTags: ['PaymentLog'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPaymentLogsQuery } = paymentApi;
