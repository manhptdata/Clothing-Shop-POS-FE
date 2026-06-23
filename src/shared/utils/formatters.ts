// ─── Shared Utility Functions ─────────────────────────────────────────────────

/** Định dạng số tiền VND. VD: 150000 → "150.000 ₫" */
export const formatCurrency = (_amount: number): string => {
  // TODO: dùng Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
  return '';
};

/** Định dạng ngày. VD: "2024-01-15T10:30:00Z" → "15/01/2024" */
export const formatDate = (_dateString: string): string => {
  // TODO: dùng Intl.DateTimeFormat('vi-VN')
  return '';
};

/** Định dạng ngày + giờ. VD: "2024-01-15T10:30:00Z" → "15/01/2024 10:30" */
export const formatDateTime = (_dateString: string): string => {
  // TODO
  return '';
};

/** Rút gọn chuỗi nếu quá dài */
export const truncateText = (_text: string, _maxLength = 50): string => {
  // TODO
  return '';
};
