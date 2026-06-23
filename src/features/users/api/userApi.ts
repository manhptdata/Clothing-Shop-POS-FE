import axiosInstance from '@/shared/api/axiosInstance';
import type { User, UserRequest } from '../types/user.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/shared/types/common.types';

export const userApi = {
  getAll: (params?: PaginationParams & { role?: string; isActive?: boolean }) =>
    axiosInstance.get<RestResponse<PageResponse<User>>>('/users', { params }),

  getById: (id: number) =>
    axiosInstance.get<RestResponse<User>>(`/users/${id}`),

  create: (data: UserRequest) =>
    axiosInstance.post<RestResponse<User>>('/users', data),

  update: (id: number, data: UserRequest) =>
    axiosInstance.put<RestResponse<User>>(`/users/${id}`, data),

  toggleActive: (id: number) =>
    axiosInstance.put<RestResponse<void>>(`/users/${id}/toggle-active`),
};
