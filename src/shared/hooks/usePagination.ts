// TODO: Implement usePagination
// Quản lý state phân trang dùng chung cho các trang danh sách
// Spring Pageable dùng page 0-based

import { useState } from 'react';

interface PaginationState {
  page: number;   // 0-based
  size: number;
}

export function usePagination(defaultSize = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: defaultSize,
  });

  const goToPage = (page: number) =>
    setPagination((prev) => ({ ...prev, page }));

  const changeSize = (size: number) =>
    setPagination({ page: 0, size });

  return { pagination, goToPage, changeSize };
}
