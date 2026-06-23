// ─── Shared Validators ────────────────────────────────────────────────────────

/** Kiểm tra số điện thoại Việt Nam (0[3|5|7|8|9]xxxxxxxx) */
export const isValidPhone = (_phone: string): boolean => {
  // TODO: /^(0[3|5|7|8|9])+([0-9]{8})$/
  return false;
};

/** Kiểm tra email hợp lệ */
export const isValidEmail = (_email: string): boolean => {
  // TODO
  return false;
};

/** Kiểm tra chuỗi không rỗng */
export const isNotEmpty = (_value: string): boolean => {
  // TODO
  return false;
};

/** Kiểm tra số dương */
export const isPositiveNumber = (_value: number): boolean => {
  // TODO
  return false;
};
