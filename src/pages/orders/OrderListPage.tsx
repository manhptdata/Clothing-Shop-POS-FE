import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { useGetOrdersQuery } from '@/redux/api/orderApi';
import type { Order } from '@/types/order.types';

export default function OrderListPage() {
  const navigate = useNavigate();

  // --- State for Pagination & Filtering ---
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<'Tất cả' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('Tất cả');

  // --- Fetch Orders from RTK Query ---
  const { data: orderResponse, isLoading } = useGetOrdersQuery({
    page: currentPage + 1,
    size: pageSize,
    status: activeTab === 'Tất cả' ? undefined : activeTab,
    sort: 'createdAt,desc',
  });

  const orders = (orderResponse?.data as any)?.result || orderResponse?.data?.content || [];
  const totalPages = (orderResponse?.data as any)?.meta?.pages || orderResponse?.data?.totalPages || 0;
  const totalElements = (orderResponse?.data as any)?.meta?.total || orderResponse?.data?.totalElements || 0;

  const columns: Column<Order>[] = [
    { 
      key: 'code', 
      header: 'Mã đơn', 
      render: (row) => (
        <span className="font-semibold text-primary hover:underline cursor-pointer">
          {row.orderNumber || row.code}
        </span>
      ) 
    },
    { 
      key: 'customerName', 
      header: 'Khách hàng', 
      render: (row) => <span className="text-on-surface font-medium">{row.customerName || 'Khách lẻ vãng lai'}</span> 
    },
    { 
      key: 'createdAt', 
      header: 'Ngày tạo', 
      render: (row) => {
        const date = new Date(row.createdAt);
        return (
          <span className="text-on-surface-variant text-sm">
            {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      } 
    },
    { 
      key: 'totalAmount', 
      header: 'Tổng tiền', 
      className: 'text-right', 
      render: (row) => (
        <span className="text-on-surface text-right block font-bold">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.totalAmount)}
        </span>
      ) 
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
        let text = 'Đang xử lý';
        if (row.status === 'COMPLETED') {
          variant = 'success';
          text = 'Hoàn thành';
        } else if (row.status === 'PENDING') {
          variant = 'warning';
          text = 'Đang xử lý';
        } else if (row.status === 'CANCELLED') {
          variant = 'danger';
          text = 'Đã hủy';
        }
        return <Badge variant={variant}>{text}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (row) => (
        <Link 
          to={`/orders/${row.id}`} 
          className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary inline-flex" 
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined">open_in_new</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>Đơn hàng</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Quản lý tất cả giao dịch và lịch sử đơn hàng của cửa hàng.</p>
        </div>
        <div className="flex gap-sm">
          <Link to="/orders/new">
            <Button
              leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
            >
              Tạo đơn mới (POS)
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-sm mb-md border-b border-outline/10 pb-sm">
        {[
          { label: 'Tất cả', value: 'Tất cả' },
          { label: 'Đang xử lý', value: 'PENDING' },
          { label: 'Hoàn thành', value: 'COMPLETED' },
          { label: 'Đã hủy', value: 'CANCELLED' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value as any);
              setCurrentPage(0);
            }}
            className={`font-button text-button px-4 py-2 rounded-lg transition-colors ${
              (activeTab === tab.value)
                ? 'bg-primary text-on-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-surface rounded-xl border border-outline/10 overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
            <p className="font-medium text-body-md">Đang tải danh sách hóa đơn...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">receipt_long</span>
            <p className="text-body-md">Không tìm thấy hóa đơn nào.</p>
          </div>
        ) : (
          <>
            <Table 
              columns={columns} 
              data={orders} 
              rowKey={(row) => row.id} 
              onRowClick={(row) => {
                navigate(`/orders/${row.id}`);
              }} 
            />
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
              totalElements={totalElements}
              pageSize={pageSize}
              onSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(0);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
