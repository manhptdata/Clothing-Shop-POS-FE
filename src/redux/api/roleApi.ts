import { baseApi } from './baseApi';

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
  system: boolean;
  permissions: string[];
}

export interface RoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<{ data: RoleResponse[] }, void>({
      query: () => ({
        url: '/roles',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }),
      providesTags: ['Role'],
    }),
    createRole: builder.mutation<{ data: RoleResponse }, RoleRequest>({
      query: (data) => ({
        url: '/roles',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Role'],
    }),
    updateRole: builder.mutation<{ data: RoleResponse }, { id: number; body: RoleRequest }>({
      query: ({ id, body }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
