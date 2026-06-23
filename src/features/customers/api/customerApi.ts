import axiosInstance from '@/shared/api/axiosInstance';
import type { Customer, CustomerGroup, CustomerRequest } from '../types/customer.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/shared/types/common.types';

export const customerApi = {
  getAll: (params?: PaginationParams & { search?: string }) =>
    axiosInstance.get<RestResponse<PageResponse<Customer>>>('/customers', { params }),

  getById: (id: number) =>
    axiosInstance.get<RestResponse<Customer>>(`/customers/${id}`),

  create: (data: CustomerRequest) =>
    axiosInstance.post<RestResponse<Customer>>('/customers', data),

  update: (id: number, data: CustomerRequest) =>
    axiosInstance.put<RestResponse<Customer>>(`/customers/${id}`, data),

  getAllGroups: () =>
    axiosInstance.get<RestResponse<CustomerGroup[]>>('/customer-groups'),
};
