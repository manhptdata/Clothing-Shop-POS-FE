import axiosInstance from '@/shared/api/axiosInstance';
import type { Invoice, InvoiceRequest } from '../types/invoice.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/shared/types/common.types';

export const invoiceApi = {
  getAll: (params?: PaginationParams & { status?: string; warehouseId?: number }) =>
    axiosInstance.get<RestResponse<PageResponse<Invoice>>>('/invoices', { params }),

  getById: (id: number) =>
    axiosInstance.get<RestResponse<Invoice>>(`/invoices/${id}`),

  create: (data: InvoiceRequest) =>
    axiosInstance.post<RestResponse<Invoice>>('/invoices', data),

  cancel: (id: number) =>
    axiosInstance.put<RestResponse<Invoice>>(`/invoices/${id}/cancel`),
};
