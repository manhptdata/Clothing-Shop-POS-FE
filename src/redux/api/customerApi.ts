import { baseApi } from './baseApi';
import type { Customer, CustomerGroup, CustomerRequest, CustomerUpdateRequest, CustomerOrderHistory, CareLogResponse  } from '@/types/customer.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/types/common.types';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<RestResponse<PageResponse<Customer>>, PaginationParams & { search?: string }>({
      query: (params) => ({
        url: '/customers',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.content
          ? [
            ...result.data.content.map(({ id }) => ({ type: 'Customer' as const, id })),
            { type: 'Customer', id: 'LIST' },
          ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    createCustomer: builder.mutation<RestResponse<Customer>, CustomerRequest>({
      query: (data) => ({
        url: '/crm/customers',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    deactivateCustomer: builder.mutation<RestResponse<void>, number>({
      query: (id) => ({
        url: `/crm/customers/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    activateCustomer: builder.mutation<RestResponse<void>, number>({
      query: (id) => ({
        url: `/crm/customers/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomerGroups: builder.query<RestResponse<CustomerGroup[]>, void>({
      query: () => ({
        url: '/customer-groups',
        method: 'GET',
      }),
    }),

    // ==============================================================
    // list all customers with search and pagination
    // ==============================================================
    searchCustomers: builder.query<RestResponse<PageResponse<Customer>>, any>({
      query: (params) => ({
        url: '/crm/customers/search',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.content
          ? [
            ...result.data.content.map(({ id }) => ({ type: 'Customer' as const, id })),
            { type: 'Customer', id: 'LIST' },
          ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),
    // ==============================================================

    // get customer by id
    getCustomerById: builder.query<RestResponse<Customer>, number | string>({
      query: (id) => ({
        url: `/crm/customers/${id}`,
        method: 'GET',
      }),
      // Khi có lệnh xóa/cập nhật thì data này sẽ tự làm mới
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

        // Thay thế đoạn cấu hình updateCustomer cũ bằng đoạn này trong src/redux/api/customerApi.ts
    updateCustomer: builder.mutation<RestResponse<Customer>, { id: number | string; data: CustomerUpdateRequest }>({
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

    // Lấy danh sách đơn hàng của khách hàng theo ID
       getCustomerOrders: builder.query<RestResponse<PageResponse<CustomerOrderHistory>>, { id: number | string; page?: number; size?: number }>({
      query: ({ id, page = 0, size = 5 }) => ({
        url: `/crm/customers/${id}/orders`,
        method: 'GET',
        params: { page: page + 1, size },
      }),
      // Cấu hình tag để nếu sau này khách mua thêm hàng, nó tự reload
      providesTags: (_result, _error, { id }) => [{ type: 'Customer', id: `ORDERS_${id}` }],
    }),
    
        // Lấy danh sách lịch sử chăm sóc của khách hàng theo ID
    getCustomerCareLogs: builder.query<RestResponse<PageResponse<CareLogResponse>>, { id: number | string; page?: number; size?: number }>({
      query: ({ id, page = 0, size = 5 }) => ({
        url: `/crm/campaigns/customers/${id}/care-logs`,
        method: 'GET',
        params: { page: page, size }, // API care-logs dùng 0-indexed!
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Customer', id: `CARE_LOGS_${id}` }],
    }),


  }),
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

} = customerApi;
