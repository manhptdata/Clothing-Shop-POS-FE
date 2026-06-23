// TODO: Implement useDebounce
// Trì hoãn cập nhật giá trị — dùng cho input search (tránh gọi API liên tục)
// Usage: const debouncedSearch = useDebounce(searchTerm, 500);

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
