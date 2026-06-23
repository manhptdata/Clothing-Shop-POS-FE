import axiosInstance from '@/shared/api/axiosInstance';
import type { Warehouse, Supplier } from '../types/warehouse.types';
import type { RestResponse, PageResponse, PaginationParams } from '@/shared/types/common.types';

export const warehouseApi = {
  getWarehouses: () =>
    axiosInstance.get<RestResponse<Warehouse[]>>('/warehouses'),

  getSuppliers: (params?: PaginationParams) =>
    axiosInstance.get<RestResponse<PageResponse<Supplier>>>('/suppliers', { params }),

  // TODO: Add receipts and returns APIs
};
