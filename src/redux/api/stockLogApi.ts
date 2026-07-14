import { baseApi } from "./baseApi";
import type { RestResponse } from "@/types/common.types";

// Format của ResultPaginationDTO từ backend (khác với PageResponse của Spring thuần)
export interface StockLogMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface StockLogPaginationResult<T> {
  meta: StockLogMeta;
  result: T[];
}


export type StockLogSource =
  | "NHAP_HANG"
  | "BAN_HANG"
  | "TRA_HANG"
  | "HUY_DON"
  | "CHUYEN_KHO"
  | "DIEU_CHINH";

export type StockLogReferenceType = "RECEIPT" | "TRANSFER" | "INVOICE" | "RETURN";

export interface StockLogItem {
  id: number;
  variantId: number;
  variantSku: string;
  productName: string;
  quantityBefore: number;
  quantityChange: number; // âm = giảm, dương = tăng
  quantityAfter: number;
  source: StockLogSource;
  referenceType: StockLogReferenceType;
  referenceId: number;
  note: string;
  createdAt: string;
}

export interface StockLogQueryParams {
  source?: StockLogSource;
  variantId?: number;
  referenceType?: StockLogReferenceType;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const SOURCE_LABELS: Record<StockLogSource, string> = {
  NHAP_HANG: "Nhập hàng",
  BAN_HANG: "Bán hàng",
  TRA_HANG: "Trả hàng",
  HUY_DON: "Hủy đơn",
  CHUYEN_KHO: "Chuyển kho",
  DIEU_CHINH: "Điều chỉnh",
};

export const SOURCE_COLORS: Record<StockLogSource, string> = {
  NHAP_HANG: "text-emerald-600 bg-emerald-50",
  BAN_HANG: "text-blue-600 bg-blue-50",
  TRA_HANG: "text-amber-600 bg-amber-50",
  HUY_DON: "text-red-600 bg-red-50",
  CHUYEN_KHO: "text-purple-600 bg-purple-50",
  DIEU_CHINH: "text-gray-600 bg-gray-100",
};

export const stockLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockLogs: builder.query<StockLogPaginationResult<StockLogItem>, StockLogQueryParams | void>({
      query: (params) => ({
        url: "stock-logs",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: RestResponse<StockLogPaginationResult<StockLogItem>>) => response.data,
      providesTags: [{ type: "StockLog" as const, id: "LIST" }],
    }),

    getStockLogsByVariant: builder.query<StockLogPaginationResult<StockLogItem>, { variantId: number; page?: number; size?: number }>({
      query: ({ variantId, ...params }) => ({
        url: `stock-logs/variant/${variantId}`,
        method: "GET",
        params,
      }),
      transformResponse: (response: RestResponse<StockLogPaginationResult<StockLogItem>>) => response.data,
      providesTags: (result, error, { variantId }) => [{ type: "StockLog" as const, id: `VARIANT-${variantId}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStockLogsQuery,
  useGetStockLogsByVariantQuery,
} = stockLogApi;
