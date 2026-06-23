import axiosInstance from '@/shared/api/axiosInstance';
import type { LoginRequest, LoginResponse, UserLogin } from '../types/auth.types';
import type { RestResponse } from '@/shared/types/common.types';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<RestResponse<LoginResponse>>('/auth/login', data),

  getAccount: () =>
    axiosInstance.get<RestResponse<{ user: UserLogin }>>('/auth/account'),

  refresh: () =>
    axiosInstance.get<RestResponse<LoginResponse>>('/auth/refresh'),

  logout: () =>
    axiosInstance.post<void>('/auth/logout'),
};
