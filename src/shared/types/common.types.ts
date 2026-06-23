// ─── Shared Common Types ───────────────────────────────────────────────────────
// Wrapper response chung của backend (RestResponse<T>) + các type dùng toàn app

/** Wrapper chuẩn của mọi response từ backend */
export interface RestResponse<T> {
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

/** Spring Page<T> trả về khi dùng Pageable */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;   // page index 0-based
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Query param phân trang chung (Spring Pageable) */
export interface PaginationParams {
  page?: number;    // 0-based
  size?: number;
  sort?: string;    // VD: "createdAt,desc"
}

/** Option dùng cho Select/Dropdown */
export interface SelectOption {
  label: string;
  value: string | number;
}
