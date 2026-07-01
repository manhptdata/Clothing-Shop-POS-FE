import React from 'react';

interface QRTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  isCreatingOrder: boolean;
  confirmCheckout: () => void;
}

export function QRTransferModal({
  isOpen,
  onClose,
  total,
  isCreatingOrder,
  confirmCheckout
}: QRTransferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-gray-950 text-base font-bold">Chuyển khoản QR</h2>
            <p className="text-gray-500 text-xs mt-0.5">Quét bằng App ngân hàng bất kỳ</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gray-100" />

        {/* QR Code */}
        <div className="flex justify-center py-6">
          <div className="bg-white rounded-2xl p-2 shadow border border-gray-100">
            <img
              src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${total}&addInfo=Thanh toan don POS&accountName=SHOP QUAN AO`}
              alt="Mã QR"
              className="w-[200px] h-[220px] object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Bank + Amount */}
        <div className="mx-6 mb-5 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Đến tài khoản</p>
              <p className="text-gray-800 text-xs font-bold">MB Bank · 0987654321</p>
              <p className="text-gray-500 text-[10px] font-semibold mt-0.5">SHOP QUAN AO</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Số tiền</p>
              <p className="text-blue-600 font-extrabold text-base">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all border border-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={confirmCheckout}
            disabled={isCreatingOrder}
            className="flex-1 flex items-center justify-center gap-2 bg-[#2ecc71] hover:bg-[#27ae60] disabled:opacity-60 text-white text-xs font-bold rounded-xl py-2.5 transition-all shadow"
          >
            {isCreatingOrder ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[15px]">sync</span>
                Đang xử lý...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                Xác nhận đã nhận tiền
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
