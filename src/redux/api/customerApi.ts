import { baseApi } from './baseApi';
import type {
  Customer,
  CustomerGroup,
  CustomerRequest,
  CustomerVoucher,
  CustomerUpdateRequest,
  CustomerOrderHistory,
  CustomerCareLog,
  CustomerGroups,
  PendingCustomerRequest,
  CreateCareLogRequest,
  UpdateCareLogRequest,
  AiSuggestionResponseDto,
  VoucherOption,
  PointHistory
} from '@/types/customer.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/types/common.types';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<RestResponse<PageResponse<Customer>>, PaginationParams & { search?: string }>({
      query: (params) => ({
        url: '/crm/customers/search',
        method: 'GET',
        params: {
          keyword: params.search || '',
          page: params.page,
          size: params.size,
        },
      }),
      providesTags: (result) =>
        result?.data?.content
          ? [
            ...result.data.content.map(({ id }) => ({ type: 'Customer' as const, id })),
            { type: 'Customer', id: 'LIST' },
          ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomerById: builder.query<RestResponse<Customer>, number>({
      query: (id) => ({
        url: `/crm/customers/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),
    getCustomerPointHistory: builder.query<RestResponse<PageResponse<PointHistory>>, { id: number } & PaginationParams>({
      query: ({ id, page, size }) => ({
        url: `/crm/customers/${id}/point-history`,
        method: 'GET',
        params: { page, size }
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Customer', id: `POINT_HISTORY_${id}` }],
    }),
    createCustomer: builder.mutation<RestResponse<Customer>, CustomerRequest>({
      query: (data) => ({
        url: '/crm/customers',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation<RestResponse<Customer>, { id: number; data: CustomerRequest }>({
      query: ({ id, data }) => ({
        url: `/crm/customers/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
    getCustomerGroups: builder.query<RestResponse<PageResponse<CustomerGroup>>, void>({
      query: () => ({
        url: '/crm/customer-groups',
        method: 'GET',
        params: {
          page: 0,
          size: 100,
        },
      }),
    }),



    searchCustomers: builder.query<RestResponse<PageResponse<Customer>>, { keyword?: string; page?: number; size?: number }>({
      query: (params) => ({
        url: '/crm/customers/search',
        method: 'GET',
        params: {
          keyword: params.keyword || '',
          page: params.page || 0,
          size: params.size || 10,
        },
      }),
      providesTags: (result) =>
        result?.data?.content
          ? [
            ...result.data.content.map(({ id }) => ({ type: 'Customer' as const, id })),
            { type: 'Customer', id: 'LIST' },
          ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    deactivateCustomer: builder.mutation<RestResponse<void>, number>({
      query: (id) => ({
        url: `/crm/customers/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    activateCustomer: builder.mutation<RestResponse<void>, number>({
      query: (id) => ({
        url: `/crm/customers/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    getCustomerOrders: builder.query<RestResponse<PageResponse<CustomerOrderHistory>>, { id: string | number; page?: number; size?: number; keyword?: string }>({
      query: ({ id, page = 0, size = 5, keyword }) => ({
        url: `/crm/customers/${id}/orders`,
        method: 'GET',
        params: { page: page + 1, size, keyword },
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Customer', id: `ORDERS_${id}` }],
    }),

    getCustomerCareLogs: builder.query<RestResponse<PageResponse<CustomerCareLog>>, { id: string | number; page?: number; size?: number }>({
      query: ({ id, page = 0, size = 5 }) => ({
        url: `/crm/campaigns/customers/${id}/care-logs`, // ĐÃ SỬA URL VÀO ĐÂY
        method: 'GET',
        params: { page, size },
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Customer', id: `CARE_LOGS_${id}` }],
    }),

    // Dùng interface mới: CustomerGroups
    searchCustomerGroups: builder.query<
      RestResponse<PageResponse<CustomerGroups>>,
      { keyword?: string; page?: number; size?: number }
    >({
      query: (params) => ({
        url: '/crm/customer-groups/search',
        method: 'GET',
        params: {
          keyword: params.keyword || '',
          page: params.page || 0,
          size: params.size || 10,
        },
      }),
      providesTags: ['Customer'],
    }),

    createCustomerGroup: builder.mutation<RestResponse<CustomerGroups>, Partial<CustomerGroups>>({
      query: (data) => ({
        url: '/crm/customer-groups',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Customer', { type: 'Customer', id: 'LIST' }],
    }),

    updateCustomerGroup: builder.mutation<RestResponse<CustomerGroups>, { id: number | string; data: Partial<CustomerGroups> }>({
      query: ({ id, data }) => ({
        url: `/crm/customer-groups/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Customer', { type: 'Customer', id: 'LIST' }],
    }),

    deleteCustomerGroup: builder.mutation<RestResponse<void>, number | string>({
      query: (id) => ({
        url: `/crm/customer-groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer', { type: 'Customer', id: 'LIST' }],
    }),

    syncCustomerRanks: builder.mutation<RestResponse<void>, void>({
      query: () => ({
        url: '/crm/customer-groups/sync-ranks',
        method: 'POST',
      }),
      invalidatesTags: ['Customer'],
    }),

    triggerBirthdayVouchers: builder.mutation<RestResponse<void>, void>({
      query: () => ({
        url: '/crm/customer-groups/trigger-birthday-vouchers',
        method: 'POST',
      }),
      invalidatesTags: ['Customer'],
    }),

    getVoucherOptions: builder.query<RestResponse<VoucherOption[]>, { status?: string } | void>({
      query: (params) => ({
        url: '/crm/customer-groups/vouchers',
        method: 'GET',
        params: params ? params : undefined,
      }),
      providesTags: ['Customer'],
    }),

    createVoucher: builder.mutation<RestResponse<void>, {
      name: string;
      code: string;
      discountAmount: number;
      discountType?: 'FIXED_AMOUNT' | 'PERCENTAGE';
      maxDiscountAmount?: number | null;
      minOrderValue?: number;
      startDate?: string | null;
      endDate?: string | null;
      totalQuantity?: number | null;
      maxUsagePerUser?: number | null;
      isPublic?: boolean;
      targetCustomerGroupId?: number | null;
      applyType?: string;
    }>({
      query: (data) => ({
        url: '/crm/customer-groups/vouchers',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Customer'],
    }),

    updateVoucher: builder.mutation<RestResponse<void>, {
      id: number;
      data: {
        name: string;
        code: string;
        discountAmount: number;
        discountType?: 'FIXED_AMOUNT' | 'PERCENTAGE';
        maxDiscountAmount?: number | null;
        minOrderValue?: number;
        startDate?: string | null;
        endDate?: string | null;
        totalQuantity?: number | null;
        maxUsagePerUser?: number | null;
        isPublic?: boolean;
        targetCustomerGroupId?: number | null;
        applyType?: string;
      };
    }>({
      query: ({ id, data }) => ({
        url: `/crm/customer-groups/vouchers/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Customer'],
    }),

    toggleVoucherStatus: builder.mutation<RestResponse<void>, number>({
      query: (id) => ({
        url: `/crm/customer-groups/vouchers/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Customer'],
    }),

    // Lấy chi tiết 1 nhóm khách hàng
    getCustomerGroupById: builder.query<RestResponse<CustomerGroups>, string | number>({
      query: (id) => ({
        url: `/crm/customer-groups/${id}`,
        method: 'GET',
      }),
      providesTags: ['Customer'],
    }),


    getCustomerGroupMembers: builder.query<
      RestResponse<PageResponse<Customer>>,
      { id: string | number; keyword?: string; page?: number; size?: number }
    >({
      query: ({ id, ...params }) => ({
        url: `/crm/customer-groups/${id}/members`,
        method: 'GET',
        params: {
          keyword: params.keyword || '',
          page: params.page || 0,
          size: params.size || 10,
        },
      }),
      providesTags: ['Customer'],
    }),



    getPendingCustomersByCampaign: builder.query<
      RestResponse<PageResponse<Customer>>,
      PendingCustomerRequest
    >({
      query: (params) => ({
        url: `/crm/campaigns/pending-customers`,
        params: {
          type: params.type,
          page: params.page,
          size: params.size,
        },
      }),
      providesTags: (result, error, arg) => [{ type: "Customer", id: `PENDING_${arg.type}` }],
    }),

    getAllCareLogs: builder.query<
      RestResponse<PageResponse<CustomerCareLog>>,
      { keyword?: string; page?: number; size?: number }
    >({
      query: (params) => ({
        url: `/crm/campaigns/care-logs`,
        method: 'GET',
        params: {
          keyword: params.keyword || '',
          page: params.page || 0,
          size: params.size || 10,
          sort: 'id,desc', // Sắp xếp mặc định mới nhất lên đầu
        },
      }),
      providesTags: ['Customer'],
    }),


    searchCareLogs: builder.query<
      RestResponse<PageResponse<CustomerCareLog>>,
      { keyword?: string; result?: string; potentialStatus?: string; page?: number; size?: number }
    >({
      query: (params) => {
        // Chỉ gửi params nào có giá trị để tránh backend lỗi
        const queryParams: any = {
          page: params.page || 0,
          size: params.size || 10,
        };
        if (params.keyword) queryParams.keyword = params.keyword;
        if (params.result) queryParams.result = params.result;
        if (params.potentialStatus) queryParams.potentialStatus = params.potentialStatus;

        return {
          url: `/crm/campaigns/care-logs/search`,
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Customer'],
    }),

    getCareLogById: builder.query<RestResponse<CustomerCareLog>, string | number>({
      query: (id) => ({
        url: `/crm/campaigns/care-logs/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Customer', id: `CARE_LOG_${id}` }],
    }),


    createCareLog: builder.mutation<RestResponse<null>, CreateCareLogRequest>({
      query: (data) => ({
        url: `/crm/campaigns/care-logs`,
        method: 'POST',
        data,
      }),
      // Invalidates để các bảng dữ liệu lịch sử tự động refresh sau khi tạo thành công
      invalidatesTags: ['Customer'],
    }),



    updateCareLog: builder.mutation<RestResponse<null>, { id: string | number; data: UpdateCareLogRequest }>({
      query: ({ id, data }) => ({
        url: `/crm/campaigns/care-logs/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id: `CARE_LOG_${id}` }, // Load lại trang chi tiết
        'Customer'
      ],
    }),


    deleteCareLog: builder.mutation<RestResponse<null>, string | number>({
      query: (id) => ({
        url: `/crm/campaigns/care-logs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),

    importCustomers: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/crm/customers/import',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['Customer'],
    }),

    getAiSuggestScript: builder.query<
      RestResponse<AiSuggestionResponseDto>,
      { campaignId: number; customerId: number }
    >({
      query: ({ campaignId, customerId }) => ({
        url: `/crm/campaigns/${campaignId}/customers/${customerId}/ai-suggest`,
        method: 'GET',
        timeout: 60000,
      }),
      // Không lưu cache quá lâu để tránh AI bị cứng nhắc
      keepUnusedDataFor: 0,
    }),

    getVoucherHistory: builder.query<
      RestResponse<PageResponse<import('@/types/customer.types').CustomerVoucherHistoryResponse>>,
      { keyword?: string; page?: number; size?: number }
    >({
      query: (params) => ({
        url: '/crm/customer-groups/vouchers/history',
        method: 'GET',
        params: {
          keyword: params.keyword || '',
          page: params.page || 0,
          size: params.size || 10,
        },
      }),
      providesTags: ['Customer'],
    }),

    revokeCustomerVoucher: builder.mutation<RestResponse<void>, { customerVoucherId: number; customerId: number }>({
      query: ({ customerVoucherId }) => ({
        url: `/crm/customers/vouchers/${customerVoucherId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { customerId }) => [{ type: 'Customer', id: customerId }],
    }),

    giveCustomerVoucher: builder.mutation<RestResponse<void>, { customerId: number; voucherId: number }>({
      query: ({ customerId, voucherId }) => ({
        url: `/crm/customers/${customerId}/vouchers/${voucherId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { customerId }) => [{ type: 'Customer', id: customerId }],
    }),

  }),

  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerPointHistoryQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerGroupsQuery,
  useSearchCustomersQuery,
  useDeactivateCustomerMutation,
  useActivateCustomerMutation,
  useGetCustomerOrdersQuery,
  useGetCustomerCareLogsQuery,
  useSearchCustomerGroupsQuery,
  useCreateCustomerGroupMutation,
  useUpdateCustomerGroupMutation,
  useDeleteCustomerGroupMutation,
  useSyncCustomerRanksMutation,
  useTriggerBirthdayVouchersMutation,
  useGetVoucherOptionsQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useToggleVoucherStatusMutation,
  useGetCustomerGroupByIdQuery,
  useGetCustomerGroupMembersQuery,
  useGetPendingCustomersByCampaignQuery,
  useGetAllCareLogsQuery,
  useSearchCareLogsQuery,
  useGetCareLogByIdQuery,
  useCreateCareLogMutation,
  useUpdateCareLogMutation,
  useDeleteCareLogMutation,
  useImportCustomersMutation,
  useLazyGetAiSuggestScriptQuery,
  useGetVoucherHistoryQuery,
  useRevokeCustomerVoucherMutation,
  useGiveCustomerVoucherMutation
} = customerApi;
