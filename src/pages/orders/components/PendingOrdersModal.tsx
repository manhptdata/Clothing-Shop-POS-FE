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
  const [activeTab, setActiveTab] = React.useState<'zero' | 'deposited'>('zero');

  const zeroOrders = pendingOrders.filter((o: any) => !o.paidAmount || o.paidAmount === 0);
  const depositedOrders = pendingOrders.filter((o: any) => o.paidAmount && o.paidAmount > 0);

  const displayOrders = activeTab === 'zero' ? zeroOrders : depositedOrders;

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Quản lý đơn hàng chờ"
          size="full"
        >
          {/* LUXURY TAB SWITCHER */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => setActiveTab('zero')}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === 'zero'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-base">hourglass_empty</span>
                <span>Chờ thanh toán (0đ)</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'zero' ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {zeroOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('deposited')}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === 'deposited'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                <span>Đã cọc 1 phần</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'deposited' ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {depositedOrders.length}
                </span>
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
              Tổng số đơn chờ: <strong className="text-slate-700">{pendingOrders.length}</strong>
            </span>
          </div>

          {displayOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
              <p className="text-sm font-bold text-slate-600">
                {activeTab === 'zero' ? 'Không có đơn hàng chờ (0đ) nào' : 'Không có đơn hàng đã cọc nào'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Các đơn hàng ở trạng thái chờ thanh toán sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[350px] bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/60 text-slate-400 font-bold text-[11px] uppercase tracking-wider bg-slate-50/80">
                    <th className="py-4 px-5">Mã đơn hàng</th>
                    <th className="py-4 px-5">Khách hàng</th>
                    <th className="py-4 px-5">Tổng tiền</th>
                    <th className="py-4 px-5">Thời gian tạo</th>
                    <th className="py-4 px-5">Ghi chú</th>
                    <th className="py-4 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-xs font-medium">
                  {displayOrders.map((order: any) => {
                    const paid = order.paidAmount || 0;
                    const isDeposited = paid > 0;
                    const customerName = order.customerName || 'Khách lẻ vãng lai';
                    const initialChar = customerName.charAt(0).toUpperCase();

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="py-4 px-5">
                          <span className="font-bold text-primary hover:underline cursor-pointer tracking-wide text-xs">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                              {initialChar}
                            </div>
                            <span className="font-bold text-slate-800">{customerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-extrabold text-sm text-slate-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                          </div>
                          {isDeposited ? (
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Đã cọc {new Intl.NumberFormat('vi-VN').format(paid)}đ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Chờ thanh toán (0đ)
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-slate-500">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-slate-500 max-w-[160px] truncate">
                          {order.note ? (
                            <span className="italic text-slate-600">"{order.note}"</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isDeposited ? (
                              <button
                                disabled
                                title="Đơn đã cọc tiền. Vui lòng sang trang Lịch sử thanh toán thực hiện Hoàn tiền trước khi hủy đơn."
                                className="bg-slate-100 text-slate-400 border border-slate-200 text-xs py-1.5 px-3 h-8 rounded-xl font-medium cursor-not-allowed flex items-center gap-1 opacity-70"
                              >
                                <span className="material-symbols-outlined text-sm">lock</span>
                                <span>Không thể hủy trực tiếp</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setOrderIdToCancel(order.id)}
                                disabled={isCancellingOrder}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs py-1.5 px-3 h-8 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Hủy đơn
                              </button>
                            )}
                            <button
                              onClick={() => handleResumePendingOrder(order)}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs py-1.5 px-3.5 h-8 rounded-xl font-bold shadow-sm shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1"
                            >
                              <span>{isDeposited ? 'Thu nốt tiền' : 'Tiếp tục'}</span>
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {orderIdToCancel !== null && (() => {
        const targetOrder = pendingOrders.find((o: any) => o.id === orderIdToCancel);
        const paid = targetOrder?.paidAmount || 0;
        return (
          <Modal
            isOpen={true}
            onClose={() => setOrderIdToCancel(null)}
            title="Xác nhận hủy đơn"
            size="sm"
          >
            <div className="flex flex-col gap-4">
              {paid > 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex flex-col gap-1.5">
                  <div className="font-bold flex items-center gap-1 text-amber-700">
                    <span className="material-symbols-outlined text-base">warning</span>
                    Cảnh báo tiền cọc / chuyển thiếu
                  </div>
                  <p>
                    Đơn hàng này khách đã cọc/chuyển <strong>{new Intl.NumberFormat('vi-VN').format(paid)}đ</strong>.
                  </p>
                  <p className="text-gray-600">
                    Bạn cần sang trang <strong>Lịch sử thanh toán</strong> thực hiện <strong>Hoàn tiền</strong> cho khách trước khi hủy đơn hàng này.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Bạn có chắc chắn muốn hủy đơn hàng chờ này không? Thao tác này không thể hoàn tác.
                </p>
              )}
              <div className="flex justify-end gap-2 mt-2">
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
        );
      })()}
    </>
  );
}
