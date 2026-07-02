import React from 'react';

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string; // Additional classes for the th/td
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string | number; // function to get unique key for each row
  className?: string;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyText = 'Không có dữ liệu',
  onRowClick,
  rowKey,
  className = '',
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="w-full text-left border-collapse min-w-max">
        <thead className="bg-surface-container-low border-b border-outline-variant/15">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/15 font-body-sm text-body-sm text-on-surface">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-md text-center">
                <div className="flex justify-center items-center py-4">
                  <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-xl text-center text-on-surface-variant">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const key = rowKey ? rowKey(row) : index;
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-outline/5 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-container-low/50 group' : 'hover:bg-surface-container-lowest'}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-4 px-6 ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
