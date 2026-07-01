import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { useGetOrdersQuery, useGetReturnOrdersQuery } from '@/redux/api/orderApi';
import type { Order, ReturnOrder } from '@/types/order.types';

import { useAppSelector } from '@/redux/hooks';

export default function OrderListPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  
  const userPerms = user?.permissions || [];
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const hasCreateOrderPermission = isAdmin || userPerms.includes('CREATE_ORDER');

  // --- Main Tab (Sales vs Returns) ---
  const [mainTab, setMainTab] = useState<'sales' | 'returns'>('sales');

  // --- State for Pagination & Filtering ---
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<'Tất cả' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED' | 'PARTIALLY_RETURNED'>('Tất cả');

  // --- Selected Return Order for Detail Modal ---
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);

  // --- State for Search ---
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset search when switching tabs
  useEffect(() => {
    setSearchQuery('');
    setDebouncedSearch('');
  }, [mainTab]);

  // --- Fetch Orders from RTK Query ---
  const { data: orderResponse, isLoading: isOrdersLoading } = useGetOrdersQuery({
    page: currentPage + 1,
    size: pageSize,
    status: activeTab === 'Tất cả' ? undefined : activeTab,
    sort: 'createdAt,desc',
    search: debouncedSearch || undefined,
  }, { skip: mainTab !== 'sales' });

  // --- Fetch Returns from RTK Query ---
  const { data: returnResponse, isLoading: isReturnsLoading } = useGetReturnOrdersQuery({
    page: currentPage + 1,
    size: pageSize,
    sort: 'createdAt,desc',
    search: debouncedSearch || undefined,
  }, { skip: mainTab !== 'returns' });

  const orders = (orderResponse?.data as any)?.result || orderResponse?.data?.content || [];
  const returnOrders = (returnResponse?.data as any)?.result || returnResponse?.data?.content || [];

  const totalPages = mainTab === 'sales'
    ? ((orderResponse?.data as any)?.meta?.pages || orderResponse?.data?.totalPages || 0)
    : ((returnResponse?.data as any)?.meta?.pages || returnResponse?.data?.totalPages || 0);

  const totalElements = mainTab === 'sales'
    ? ((orderResponse?.data as any)?.meta?.total || orderResponse?.data?.totalElements || 0)
    : ((returnResponse?.data as any)?.meta?.total || returnResponse?.data?.totalElements || 0);

  const salesColumns: Column<Order>[] = [
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
        } else if (row.status === 'RETURNED') {
          variant = 'danger';
          text = 'Đã trả hàng';
        } else if (row.status === 'PARTIALLY_RETURNED') {
          variant = 'warning';
          text = 'Trả hàng một phần';
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

  const returnColumns: Column<ReturnOrder>[] = [
    { 
      key: 'returnNumber', 
      header: 'Mã phiếu trả', 
      render: (row) => (
        <span className="font-semibold text-primary">
          {row.returnNumber}
        </span>
      ) 
    },
    { 
      key: 'originalOrderNumber', 
      header: 'Mã hóa đơn gốc', 
      render: (row) => (
        <span className="text-on-surface font-medium hover:underline text-primary cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          navigate(`/orders/${row.originalOrderId}`);
        }}>
          {row.originalOrderNumber}
        </span>
      ) 
    },
    { 
      key: 'customerName', 
      header: 'Khách hàng', 
      render: (row) => <span className="text-on-surface font-medium">{row.customerName || 'Khách lẻ vãng lai'}</span> 
    },
    { 
      key: 'reason', 
      header: 'Lý do', 
      render: (row) => <span className="text-on-surface-variant text-sm truncate max-w-[200px] block">{row.reason || 'N/A'}</span> 
    },
    { 
      key: 'createdAt', 
      header: 'Ngày trả', 
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
      key: 'totalRefundAmount', 
      header: 'Tiền hoàn lại', 
      className: 'text-right', 
      render: (row) => (
        <span className="text-primary text-right block font-bold">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.totalRefundAmount)}
        </span>
      ) 
    },
  ];

  const isLoading = mainTab === 'sales' ? isOrdersLoading : isReturnsLoading;
  const currentData = mainTab === 'sales' ? orders : returnOrders;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>Đơn hàng</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Quản lý giao dịch, hóa đơn bán hàng và phiếu trả hàng của cửa hàng.</p>
        </div>
        <div className="flex gap-sm">
          {hasCreateOrderPermission && (
            <Link to="/orders/new">
              <Button
                leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
              >
                Tạo đơn mới (POS)
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex gap-md mb-md border-b border-outline/10 pb-2">
        <button
          onClick={() => {
            setMainTab('sales');
            setCurrentPage(0);
          }}
          className={`font-semibold text-lg pb-1 border-b-2 transition-colors ${
            mainTab === 'sales'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Đơn bán hàng
        </button>
        <button
          onClick={() => {
            setMainTab('returns');
            setCurrentPage(0);
          }}
          className={`font-semibold text-lg pb-1 border-b-2 transition-colors ${
            mainTab === 'returns'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Đơn trả hàng
        </button>
      </div>

      {/* Filter Tabs for Sales Mode */}
      {mainTab === 'sales' && (
        <div className="flex flex-wrap gap-sm mb-md border-b border-outline/10 pb-sm">
          {[
            { label: 'Tất cả', value: 'Tất cả' },
            { label: 'Đang xử lý', value: 'PENDING' },
            { label: 'Hoàn thành', value: 'COMPLETED' },
            { label: 'Đã hủy', value: 'CANCELLED' },
            { label: 'Đã trả hàng', value: 'RETURNED' },
            { label: 'Trả hàng một phần', value: 'PARTIALLY_RETURNED' }
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
      )}

      {/* Search Bar */}
      <div className="mb-md max-w-md relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          placeholder={mainTab === 'sales' ? "Tìm kiếm mã hóa đơn, tên khách hàng..." : "Tìm kiếm mã phiếu trả, mã hóa đơn gốc, tên khách..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface rounded-xl border border-outline/10 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm placeholder:text-on-surface-variant/50 text-on-surface transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant/70 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-surface rounded-xl border border-outline/10 overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
            <p className="font-medium text-body-md">Đang tải dữ liệu...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">receipt_long</span>
            <p className="text-body-md">Không tìm thấy thông tin nào.</p>
          </div>
        ) : (
          <>
            {mainTab === 'sales' ? (
              <Table 
                columns={salesColumns} 
                data={orders} 
                rowKey={(row) => row.id} 
                onRowClick={(row) => {
                  navigate(`/orders/${row.id}`);
                }} 
              />
            ) : (
              <Table 
                columns={returnColumns} 
                data={returnOrders} 
                rowKey={(row) => row.id} 
                onRowClick={(row) => {
                  setSelectedReturn(row);
                }} 
              />
            )}
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

      {/* Read-only Return Order Detail Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-outline/10 max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-md border-b border-outline/10 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                Chi tiết phiếu trả hàng {selectedReturn.returnNumber}
              </h3>
              <button 
                onClick={() => setSelectedReturn(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-md space-y-md overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-sm text-sm border-b border-outline/5 pb-sm">
                <div>
                  <span className="text-on-surface-variant block text-xs">Mã hóa đơn gốc:</span>
                  <span className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => {
                    navigate(`/orders/${selectedReturn.originalOrderId}`);
                    setSelectedReturn(null);
                  }}>
                    {selectedReturn.originalOrderNumber}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs">Khách hàng:</span>
                  <span className="font-semibold text-on-surface">{selectedReturn.customerName || 'Khách lẻ vãng lai'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs">Ngày thực hiện:</span>
                  <span className="text-on-surface">{new Date(selectedReturn.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs">Người lập phiếu:</span>
                  <span className="text-on-surface">{selectedReturn.createdByUsername}</span>
                </div>
              </div>

              <div className="space-y-xs">
                <span className="text-xs text-on-surface-variant font-bold block">Sản phẩm hoàn trả:</span>
                <div className="border border-outline/10 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline/10 font-bold">
                        <th className="py-2 px-3">Sản phẩm</th>
                        <th className="py-2 px-3 text-center">SL</th>
                        <th className="py-2 px-3 text-right">Giá hoàn</th>
                        <th className="py-2 px-3 text-right font-bold">Tổng hoàn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/5">
                      {selectedReturn.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container-lowest/30">
                          <td className="py-2 px-3">
                            <span className="font-semibold block">{item.productName}</span>
                            <span className="text-[10px] text-on-surface-variant">SKU: {item.productSku}</span>
                          </td>
                          <td className="py-2 px-3 text-center">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.refundPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedReturn.reason && (
                <div className="bg-surface-container-lowest p-sm rounded-xl border border-outline/5 text-sm">
                  <span className="text-xs text-on-surface-variant block font-bold">Lý do trả hàng:</span>
                  <p className="italic text-on-surface-variant mt-0.5">"{selectedReturn.reason}"</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-xs border-t border-outline/5">
                <span className="font-semibold text-on-surface">Tổng cộng hoàn tiền:</span>
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedReturn.totalRefundAmount)}
                </span>
              </div>
            </div>
            <div className="p-md bg-surface-container-lowest border-t border-outline/10 flex justify-end gap-sm">
              <button
                onClick={() => {
                  navigate(`/orders/${selectedReturn.originalOrderId}`);
                  setSelectedReturn(null);
                }}
                className="px-md py-sm border border-primary text-primary hover:bg-primary/5 rounded font-button text-button transition-colors"
              >
                Xem hóa đơn gốc
              </button>
              <button
                onClick={() => setSelectedReturn(null)}
                className="px-md py-sm bg-outline/20 hover:bg-outline/30 text-on-surface rounded font-button text-button transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
