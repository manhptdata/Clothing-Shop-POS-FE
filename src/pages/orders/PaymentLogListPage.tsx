import React, { useState, useEffect } from 'react';
import { useGetPaymentLogsQuery, useRefundPaymentLogMutation } from '@/redux/api/paymentApi';
import type { PaymentLog } from '@/types/payment.types';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
  const [filterGateway, setFilterGateway] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Refund Modal state
  const [selectedLog, setSelectedLog] = useState<PaymentLog | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmountInput, setRefundAmountInput] = useState<string>('');

  const [refundPaymentLog, { isLoading: isRefunding }] = useRefundPaymentLogMutation();

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

  const openRefundModal = (log: PaymentLog) => {
    setSelectedLog(log);
    setRefundAmountInput('');
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedLog) return;
    try {
      const amount = refundAmountInput.trim() !== '' ? Number(refundAmountInput) : undefined;
      if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
        toast.error('Số tiền hoàn không hợp lệ');
        return;
      }

      await refundPaymentLog({ id: selectedLog.id, refundAmount: amount }).unwrap();
      toast.success('Xác nhận hoàn tiền thành công!');
      setIsRefundModalOpen(false);
      setSelectedLog(null);
    } catch (e: any) {
      toast.error(e?.data?.message || 'Có lỗi xảy ra khi hoàn tiền');
    }
  };

  const { data: response, isLoading } = useGetPaymentLogsQuery({
    page: currentPage,
    size: pageSize,
    orderNumber: debouncedOrderNumber,
    status: filterStatus,
    gateway: filterGateway,
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
        if (row.status === 'OVERPAID') return <Badge variant="warning">Chuyển thừa</Badge>;
        if (row.status === 'DUPLICATE_PAYMENT') return <Badge variant="warning">Chuyển trùng</Badge>;
        if (row.status === 'REFUNDED') return <Badge variant="success">Đã hoàn tiền</Badge>;
        if (row.status === 'ERROR') return <Badge variant="danger">Lỗi hệ thống</Badge>;
        return <Badge variant="default">{row.status}</Badge>;
      },
    },
    {
      key: 'gateway',
      header: 'Nguồn xác nhận',
      render: (row) => {
        if (row.gateway === 'MANUAL') {
          return <Badge variant="warning"><i className="fa-solid fa-hand-pointer mr-1"></i>Duyệt tay</Badge>;
        }
        return <Badge variant="info"><i className="fa-solid fa-robot mr-1"></i>Tự động (SePay)</Badge>;
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
    {
      key: 'actions',
      header: 'Hành động',
      className: 'text-center',
      render: (row) => {
        if (row.status === 'OVERPAID' || row.status === 'DUPLICATE_PAYMENT') {
          return (
            <Button
              size="sm"
              variant="outline"
              className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
              onClick={() => openRefundModal(row)}
            >
              <i className="fa-solid fa-rotate-left mr-1"></i> Hoàn tiền
            </Button>
          );
        }
        return <span className="text-gray-400 text-xs">-</span>;
      },
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
              { value: 'OVERPAID', label: 'Chuyển thừa' },
              { value: 'DUPLICATE_PAYMENT', label: 'Chuyển trùng' },
              { value: 'REFUNDED', label: 'Đã hoàn tiền' },
              { value: 'ERROR', label: 'Lỗi hệ thống' },
            ]}
          />
        </div>
        <div className="w-48">
          <Select 
            label="Nguồn xác nhận"
            value={filterGateway}
            onChange={(val) => setFilterGateway(val)}
            options={[
              { value: '', label: 'Tất cả nguồn' },
              { value: 'SEPAY', label: 'Tự động (SePay)' },
              { value: 'MANUAL', label: 'Duyệt thủ công' },
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

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Xác nhận hoàn tiền cho khách"
      >
        {selectedLog && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Bạn đang thực hiện xác nhận hoàn tiền mặt cho giao dịch:
            </p>
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1 border border-gray-200">
              <div><span className="font-semibold text-gray-700">Mã tham chiếu:</span> {selectedLog.referenceCode}</div>
              <div><span className="font-semibold text-gray-700">Đơn hàng:</span> {selectedLog.orderNumber || 'Không có'}</div>
              <div>
                <span className="font-semibold text-gray-700">Số tiền nhận:</span>{' '}
                <span className="font-bold text-green-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedLog.transferAmount)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Trạng thái:</span>{' '}
                <Badge variant="warning">{selectedLog.status === 'OVERPAID' ? 'Chuyển thừa' : 'Chuyển trùng'}</Badge>
              </div>
            </div>

            <Input
              label="Số tiền hoàn thực tế (VND)"
              type="number"
              placeholder="Để trống nếu hoàn toàn bộ"
              value={refundAmountInput}
              onChange={(e) => setRefundAmountInput(e.target.value)}
            />

            <p className="text-xs text-gray-500 italic">
              * Lưu ý: Thao tác này sẽ ghi chú thông tin hoàn tiền vào Log giao dịch và đổi trạng thái sang <span className="font-semibold text-green-600">Đã hoàn tiền</span>.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setIsRefundModalOpen(false)}
                disabled={isRefunding}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmRefund}
                isLoading={isRefunding}
              >
                Xác nhận hoàn tiền
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

