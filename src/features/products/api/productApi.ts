import axiosInstance from '@/shared/api/axiosInstance';
import type { Product, ProductRequest, ProductUpdateRequest, ProductFilterParams } from '../types/product.types';
import type { RestResponse, PageResponse } from '@/shared/types/common.types';

export const productApi = {
  getAll: (params?: ProductFilterParams) =>
    axiosInstance.get<RestResponse<PageResponse<Product>>>('/products', { params }),

  getById: (id: number) =>
    axiosInstance.get<RestResponse<Product>>(`/products/${id}`),

  create: (data: ProductRequest) =>
    axiosInstance.post<RestResponse<Product>>('/products', data),

  update: (id: number, data: ProductUpdateRequest) =>
    axiosInstance.put<RestResponse<Product>>(`/products/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<RestResponse<Product>>(`/products/${id}`),

  hardDelete: (id: number) =>
    axiosInstance.delete<RestResponse<string>>(`/products/${id}/permanent`),
};
