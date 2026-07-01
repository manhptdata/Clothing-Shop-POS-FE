// ─── Global Constants ─────────────────────────────────────────────────────────

export const ACCESS_TOKEN_KEY = 'access_token' as const;

export const DEFAULT_PAGE_SIZE = 10 as const;

/** Mapping OrderStatus → tiếng Việt */
export const INVOICE_STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  PENDING: 'Chờ xử lý',
};

/** Mapping ReceiptStatus → tiếng Việt */
export const RECEIPT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
};

/** Mapping ReturnTicketStatus → tiếng Việt */
export const RETURN_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

/** Mapping RoleEnum → tiếng Việt */
export const ROLE_LABEL: Record<string, string> = {
  ROLE_ADMIN: 'Quản lý',
  ROLE_SALE: 'Bán hàng',
  ROLE_CS: 'CSKH',
  ROLE_WH: 'Kho',
};

/** Mapping CustomerStatus → tiếng Việt */
export const CUSTOMER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
};
