import { baseApi } from './baseApi';
import type { User, UserRequest } from '@/types/user.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/types/common.types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<RestResponse<PageResponse<User>>, PaginationParams & { role?: string; isActive?: boolean }>({
      query: (params) => ({
        url: '/users',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.content
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getUserById: builder.query<RestResponse<User>, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<RestResponse<User>, UserRequest>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation<RestResponse<User>, { id: number; data: UserRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    toggleUserActive: builder.mutation<RestResponse<void>, number>({
      query: (id) => ({
        url: `/users/${id}/toggle-active`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserActiveMutation,
} = userApi;
