import { baseApi } from './baseApi';
import type { User, UserRequest } from '@/types/user.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/types/common.types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<RestResponse<PageResponse<User>>, PaginationParams & { active?: boolean; search?: string }>({
      query: (params) => ({
        url: '/admin/employees',
        method: 'GET',
        params,
      }),
      providesTags: (result) => {
        const content = result?.data?.content;
        return content && Array.isArray(content)
          ? [
              ...content.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }];
      }
    }),
    getUserById: builder.query<RestResponse<User>, number>({
      query: (id) => ({
        url: `/admin/employees/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<RestResponse<User>, UserRequest>({
      query: (data) => ({
        url: '/admin/employees',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation<RestResponse<User>, { id: number; data: Partial<UserRequest> }>({
      query: ({ id, data }) => ({
        url: `/admin/employees/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    toggleUserActive: builder.mutation<RestResponse<void>, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/employees/${id}/status`,
        method: 'PUT',
        params: { isActive }
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    changePassword: builder.mutation<RestResponse<void>, { oldPassword: string; newPassword: string }>({
      query: (data) => ({
        url: `/users/me/password`,
        method: 'POST',
        data,
      }),
    }),
    generateSecurityPin: builder.mutation<RestResponse<{ pin: string }>, void>({
      query: () => ({
        url: `/users/me/security-pin`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    getSecurityPin: builder.query<RestResponse<{ pin: string | null }>, void>({
      query: () => ({
        url: `/users/me/security-pin`,
        method: 'GET'
      }),
      providesTags: ['User'],
    }),
    changeSecurityPin: builder.mutation<void, { pin: string }>({
      query: (data) => ({
        url: `/users/me/security-pin/change`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserActiveMutation,
  useChangePasswordMutation,
  useGenerateSecurityPinMutation,
  useGetSecurityPinQuery,
  useChangeSecurityPinMutation,
} = userApi;
