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
  UpdateCareLogRequest
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

    getCustomerOrders: builder.query<RestResponse<PageResponse<CustomerOrderHistory>>, { id: string | number; page?: number; size?: number }>({
      query: ({ id, page = 0, size = 5 }) => ({
        url: `/crm/customers/${id}/orders`,
        method: 'GET',
        params: { page: page + 1, size },
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
      { keyword?: string; result?: string; page?: number; size?: number }
    >({
      query: (params) => {
        // Chỉ gửi params nào có giá trị để tránh backend lỗi
        const queryParams: any = {
          page: params.page || 0,
          size: params.size || 10,
          sort: 'id,desc',
        };
        if (params.keyword) queryParams.keyword = params.keyword;
        if (params.result) queryParams.result = params.result;

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

  }), // <--- Lưu ý: Dấu đóng ngoặc nhọn này phải nằm dưới cùng của khối endpoints

  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerGroupsQuery,
  useSearchCustomersQuery,
  useDeactivateCustomerMutation,
  useActivateCustomerMutation,
  useGetCustomerOrdersQuery,
  useGetCustomerCareLogsQuery,
  useSearchCustomerGroupsQuery,
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
} = customerApi;
