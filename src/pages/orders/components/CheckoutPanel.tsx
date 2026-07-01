import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CartItem } from '../useOrderCreate';

interface CheckoutPanelProps {
  customerSelectionNode: React.ReactNode;
  cart: CartItem[];
  handleUpdateQuantity: (variantId: number, amount: number) => void;
  handleRemoveFromCart: (variantId: number) => void;
  customerPaid: number | '';
  setIsPaidModified: (modified: boolean) => void;
  setCustomerPaid: (amount: number | '') => void;
  total: number;
  changeAmount: number;
  note: string;
  setNote: (note: string) => void;
  subtotal: number;
  tax: number;
  customerType: 'GUEST' | 'MEMBER';
  pointsDiscount: number;
  pointsToUse: number;
  voucherDiscount: number;
  voucherCode: string;
  handleCheckout: () => void;
  isCreatingOrder: boolean;
  paymentMethod: 'CASH' | 'QR_PAYOS';
  setPaymentMethod: (method: 'CASH' | 'QR_PAYOS') => void;
  handleSaveTemporary: () => void;
  isSavingTemporary: boolean;
  pendingOrderId: number | null;
  autoPrint: boolean;
  setAutoPrint: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  customerSelectionNode,
  cart,
  customerPaid,
  setIsPaidModified,
  setCustomerPaid,
  total,
  changeAmount,
  note,
  setNote,
  subtotal,
  tax,
  customerType,
  pointsDiscount,
  pointsToUse,
  voucherDiscount,
  voucherCode,
  handleCheckout,
  isCreatingOrder,
  paymentMethod,
  setPaymentMethod,
  handleSaveTemporary,
  isSavingTemporary,
  pendingOrderId,
  autoPrint,
  setAutoPrint,
}) => {

  // Global hotkeys for checkout action: F9 (Payment/Checkout), F8 (Save Temporary)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleSaveTemporary();
      } else if (e.key === 'F10') {
        e.preventDefault();
        setAutoPrint(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCheckout, handleSaveTemporary]);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="w-full lg:w-[350px] xl:w-[380px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Customer CRM section */}
        {customerSelectionNode}

        {/* Financial Details */}
        <div className="flex flex-col gap-3 py-2">
          <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
            <span>Tổng tiền hàng ({totalItemsCount} sản phẩm)</span>
            <span className="text-gray-900 font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
            </span>
          </div>

          {tax > 0 && (
            <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
              <span>Thuế (VAT 8%)</span>
              <span className="text-gray-900 font-bold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tax)}
              </span>
            </div>
          )}

          {/* Point discount rendering */}
          {customerType === 'MEMBER' && pointsDiscount > 0 && (
            <div className="flex justify-between items-center text-green-600 text-xs font-bold">
              <span>Điểm tích lũy (-{pointsToUse} điểm)</span>
              <span>
                -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointsDiscount)}
              </span>
            </div>
          )}

          {/* Voucher discount rendering */}
          {customerType === 'MEMBER' && voucherDiscount > 0 && (
            <div className="flex justify-between items-center text-green-600 text-xs font-bold">
              <span>Voucher giảm giá ({voucherCode})</span>
              <span>
                -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucherDiscount)}
              </span>
            </div>
          )}

          <div className="h-px bg-gray-100 w-full my-1"></div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-700 font-bold">Khách phải trả</span>
            <span className="text-lg font-extrabold text-blue-600 tracking-tight">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="pt-2 border-t border-gray-100">
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Phương thức thanh toán</label>
          <div className="flex bg-gray-50 rounded-lg p-0.5 border border-gray-200">
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${paymentMethod === 'CASH'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              Tiền mặt
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('QR_PAYOS');
                setCustomerPaid('');
                setIsPaidModified(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${paymentMethod === 'QR_PAYOS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              Chuyển khoản QR
            </button>
          </div>
        </div>

        {/* Payment Fields */}
        {paymentMethod === 'CASH' ? (
          <div className="grid grid-cols-2 gap-3">
            {/* Khách trả tiền */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Khách trả tiền</label>
              <input
                type="number"
                placeholder="0"
                value={customerPaid}
                onChange={(e) => {
                  setIsPaidModified(true);
                  setCustomerPaid(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className="w-full h-9 bg-white border border-gray-300 rounded-lg px-3 text-xs text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
              {customerPaid !== '' && customerPaid < total && (
                <p className="text-[10px] text-red-500 font-medium">Khách trả chưa đủ tiền</p>
              )}
            </div>

            {/* Tiền trả lại */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Tiền trả lại</label>
              <div className="w-full h-9 bg-gray-50 border border-gray-300 rounded-lg px-3 text-xs text-green-600 font-bold flex items-center">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(changeAmount)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-xs text-blue-700 font-medium">
              Khách hàng quét mã QR thanh toán sau khi bạn xác nhận chốt đơn.
            </p>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
          {/* Order Note */}
          <Input
            type="text"
            placeholder="Ghi chú đơn hàng..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-[16px] text-gray-400">edit_note</span>}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-xs"
          />

          {/* Automate print invoice checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="print-auto"
              type="checkbox"
              checked={autoPrint}
              onChange={(e) => setAutoPrint(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="print-auto" className="text-xs text-gray-600 font-medium select-none cursor-pointer">
              In hóa đơn tự động [F10]
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSaveTemporary}
              disabled={isCreatingOrder || isSavingTemporary || cart.length === 0}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all border-none text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              {isSavingTemporary ? (
                'Đang lưu...'
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">pause_presentation</span>
                  {pendingOrderId ? 'Cập nhật' : 'Lưu tạm [F8]'}
                </>
              )}
            </Button>

            <Button
              onClick={handleCheckout}
              disabled={isCreatingOrder || isSavingTemporary || cart.length === 0}
              className="flex-[1.5] py-3 bg-[#0088FF] hover:bg-[#0077EE] text-white rounded-xl font-bold transition-all border-none text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              {isCreatingOrder ? (
                'Đang xử lý...'
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">credit_card</span>
                  Thanh toán [F9]
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
