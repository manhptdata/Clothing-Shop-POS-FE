// ─── Shared Validators ────────────────────────────────────────────────────────

/** Kiểm tra số điện thoại Việt Nam (0[3|5|7|8|9]xxxxxxxx) */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone);
};

/** Kiểm tra email hợp lệ */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/** Kiểm tra chuỗi không rỗng */
export const isNotEmpty = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

/** Kiểm tra số dương */
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value > 0;
};
