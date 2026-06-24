// ─── Shared Utility Functions ─────────────────────────────────────────────────

/** Định dạng số tiền VND. VD: 150000 → "150.000 ₫" */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

/** Định dạng ngày. VD: "2024-01-15T10:30:00Z" → "15/01/2024" */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(d);
  } catch {
    return dateString;
  }
};

/** Định dạng ngày + giờ. VD: "2024-01-15T10:30:00Z" → "15/01/2024 10:30" */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  } catch {
    return dateString;
  }
};

/** Rút gọn chuỗi nếu quá dài */
export const truncateText = (text: string, maxLength = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
