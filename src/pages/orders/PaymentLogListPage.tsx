import React, { useState, useEffect } from 'react';
import { useGetPaymentLogsQuery } from '@/redux/api/paymentApi';
import type { PaymentLog } from '@/types/payment.types';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useLazyGetOrderIdByNumberQuery } from '@/redux/api/orderApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PaymentLogListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const [filterOrderNumber, setFilterOrderNumber] = useState('');
  const [debouncedOrderNumber, setDebouncedOrderNumber] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOrderNumber(filterOrderNumber);
    }, 500);
    return () => clearTimeout(handler);
  }, [filterOrderNumber]);

  const [getOrderId] = useLazyGetOrderIdByNumberQuery();

  const handleOrderClick = async (orderNumber?: string) => {
    if (!orderNumber) return;
    try {
      const res = await getOrderId(orderNumber).unwrap();
      const id = typeof res === 'number' ? res : (res as any).data || (res as any).result;
      if (id) {
        navigate(`/orders/${id}`);
      } else {
        toast.error('Không lấy được ID đơn hàng');
      }
    } catch (e) {
      toast.error('Đơn hàng không tồn tại hoặc đã bị xóa');
    }
  };

  const { data: response, isLoading } = useGetPaymentLogsQuery({
    page: currentPage,
    size: pageSize,
    orderNumber: debouncedOrderNumber,
    status: filterStatus,
    startDate: filterDateFrom,
    endDate: filterDateTo,
  });

  const logs = response?.data?.content || [];
  const totalElements = response?.data?.totalElements || 0;
  const totalPages = response?.data?.totalPages || 0;

  const columns: Column<PaymentLog>[] = [
    {
      key: 'referenceCode',
      header: 'Mã tham chiếu',
      render: (row) => <span className="font-medium text-gray-900">{row.referenceCode}</span>,
    },
    {
      key: 'orderNumber',
      header: 'Mã đơn hàng',
      render: (row) => row.orderNumber ? (
        <span 
          className="text-blue-600 font-semibold cursor-pointer hover:underline"
          onClick={() => handleOrderClick(row.orderNumber)}
        >
          {row.orderNumber}
        </span>
      ) : (
        <span className="text-gray-400">Không có</span>
      ),
    },
    {
      key: 'transferAmount',
      header: 'Số tiền',
      className: 'text-right',
      render: (row) => row.transferAmount ? (
        <span className="font-bold text-green-600">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.transferAmount)}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => {
        if (row.status === 'SUCCESS') return <Badge variant="success">Thành công</Badge>;
        if (row.status === 'PROCESSING') return <Badge variant="info">Đang xử lý</Badge>;
        if (row.status === 'INSUFFICIENT') return <Badge variant="warning">Thiếu tiền</Badge>;
        if (row.status === 'NO_ORDER') return <Badge variant="warning">Không khớp đơn</Badge>;
        if (row.status === 'ERROR') return <Badge variant="danger">Lỗi hệ thống</Badge>;
        return <Badge variant="default">{row.status}</Badge>;
      },
    },
    {
      key: 'content',
      header: 'Nội dung',
      render: (row) => <span className="text-gray-600 text-sm">{row.content}</span>,
    },
    {
      key: 'createdAt',
      header: 'Thời gian tạo',
      render: (row) => (
        <span className="text-gray-500 text-sm">
          {new Date(row.createdAt).toLocaleString('vi-VN')}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
          <p className="text-gray-500 mt-1">Quản lý lịch sử nhận thông báo thanh toán QR từ SePay</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="w-64">
          <Input 
            label="Mã đơn hàng" 
            placeholder="Tìm theo mã đơn (vd: HD-2023...)"
            value={filterOrderNumber}
            onChange={(e) => setFilterOrderNumber(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select 
            label="Trạng thái"
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'SUCCESS', label: 'Thành công' },
              { value: 'PROCESSING', label: 'Đang xử lý' },
              { value: 'INSUFFICIENT', label: 'Thiếu tiền' },
              { value: 'NO_ORDER', label: 'Không khớp đơn' },
              { value: 'ERROR', label: 'Lỗi hệ thống' },
            ]}
          />
        </div>
        <div className="w-48">
          <Input 
            label="Từ ngày" 
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Input 
            label="Đến ngày" 
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">
            <i className="fa-solid fa-spinner fa-spin text-3xl"></i>
          </div>
        ) : (
          <>
            <Table data={logs} columns={columns} />
            {totalElements > 0 && (
              <div className="border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                  onSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(0);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
