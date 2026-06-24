import { baseApi } from './baseApi';
import type { Customer, CustomerGroup, CustomerRequest } from '@/types/customer.types';
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
    getCustomerById: builder.query<RestResponse<Customer>, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation<RestResponse<Customer>, CustomerRequest>({
      query: (data) => ({
        url: '/customers',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation<RestResponse<Customer>, { id: number; data: CustomerRequest }>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
    getCustomerGroups: builder.query<RestResponse<CustomerGroup[]>, void>({
      query: () => ({
        url: '/customer-groups',
        method: 'GET',
      }),
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
} = customerApi;
