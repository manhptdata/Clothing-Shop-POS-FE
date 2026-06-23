// TODO: Implement Pagination
// Props:
//   totalPages: number
//   currentPage: number         (0-based, theo Spring)
//   onPageChange: (page: number) => void
//   totalElements?: number
//   pageSize?: number
//   onSizeChange?: (size: number) => void

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination(_props: PaginationProps) {
  // TODO
  return <div />;
}
