import React from 'react';
import { Button } from './Button';
import { Select } from './Select';

export interface PaginationProps {
  totalPages: number;
  currentPage: number; // 0-based
  onPageChange: (page: number) => void;
  totalElements?: number;
  pageSize?: number;
  onSizeChange?: (size: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  totalElements,
  pageSize = 10,
  onSizeChange,
  className = '',
}) => {
  if (totalPages <= 1 && !totalElements) return null;

  const handlePrev = () => {
    if (currentPage > 0) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = totalElements ? Math.min((currentPage + 1) * pageSize, totalElements) : null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 rounded flex items-center justify-center font-button text-button transition-colors ${
            i === currentPage
              ? 'bg-primary text-on-primary'
              : 'text-on-surface hover:bg-surface-container'
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center py-4 px-6 bg-surface-container-low/50 border-t border-outline/10 gap-4 ${className}`}>
      <div className="flex items-center gap-4 text-on-surface-variant font-body-sm text-body-sm">
        {totalElements !== undefined && endItem !== null && (
          <span>
            Hiển thị {startItem} đến {endItem} trong {totalElements} kết quả
          </span>
        )}
        {onSizeChange && (
          <div className="flex items-center gap-2">
            <span>Hiển thị:</span>
            <Select
              className="w-20 py-1"
              options={[
                { label: '10', value: 10 },
                { label: '20', value: 20 },
                { label: '50', value: 50 },
                { label: '100', value: 100 },
              ]}
              value={pageSize}
              onChange={(v) => onSizeChange(Number(v))}
            />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 border-outline/20 text-on-surface-variant hover:border-primary hover:text-primary rounded"
            onClick={handlePrev}
            disabled={currentPage === 0}
            leftIcon={<span className="material-symbols-outlined text-[18px]">chevron_left</span>}
          />
          <div className="flex items-center space-x-1">
            {renderPageNumbers()}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 border-outline/20 text-on-surface-variant hover:border-primary hover:text-primary rounded"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            leftIcon={<span className="material-symbols-outlined text-[18px]">chevron_right</span>}
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;
