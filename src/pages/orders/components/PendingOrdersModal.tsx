import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PendingOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrders: any[];
  isCancellingOrder: boolean;
  orderIdToCancel: number | null;
  setOrderIdToCancel: (id: number | null) => void;
  handleResumePendingOrder: (order: any) => void;
  handleCancelPendingOrder: (id: number) => Promise<void>;
}

export function PendingOrdersModal({
  isOpen,
  onClose,
  pendingOrders,
  isCancellingOrder,
  orderIdToCancel,
  setOrderIdToCancel,
  handleResumePendingOrder,
  handleCancelPendingOrder
}: PendingOrdersModalProps) {
  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Đơn hàng chờ thanh toán"
          size="full"
        >
          {pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">receipt_long</span>
              <p className="text-sm font-semibold">Không có đơn hàng chờ nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[300px] bg-white rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-bold text-xs uppercase bg-gray-50">
                    <th className="py-3.5 px-4">Mã đơn hàng</th>
                    <th className="py-3.5 px-4">Khách hàng</th>
                    <th className="py-3.5 px-4">Tổng tiền</th>
                    <th className="py-3.5 px-4">Ngày tạo</th>
                    <th className="py-3.5 px-4">Ghi chú</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800 text-xs">
                  {pendingOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-600">{order.orderNumber}</td>
                      <td className="py-3.5 px-4 font-bold">{order.customerName || 'Khách lẻ'}</td>
                      <td className="py-3.5 px-4 font-extrabold text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 max-w-[150px] truncate">{order.note || '-'}</td>
                      <td className="py-3.5 px-4 text-right flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 text-xs py-1 px-3 h-8 font-semibold"
                          onClick={() => setOrderIdToCancel(order.id)}
                          disabled={isCancellingOrder}
                        >
                          Hủy đơn
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#2ecc71] hover:bg-[#27ae60] text-white text-xs py-1 px-3 h-8 font-bold"
                          onClick={() => handleResumePendingOrder(order)}
                        >
                          Tiếp tục
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {orderIdToCancel !== null && (
        <Modal
          isOpen={true}
          onClose={() => setOrderIdToCancel(null)}
          title="Xác nhận hủy đơn"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn hủy đơn hàng chờ này không? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrderIdToCancel(null)}
                className="font-semibold text-gray-500"
              >
                Bỏ qua
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold border-none"
                onClick={async () => {
                  const id = orderIdToCancel;
                  setOrderIdToCancel(null);
                  if (id) {
                    await handleCancelPendingOrder(id);
                  }
                }}
              >
                Hủy đơn hàng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
