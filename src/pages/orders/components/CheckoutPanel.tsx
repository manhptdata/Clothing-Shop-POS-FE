import React from 'react';
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
}

export const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  customerSelectionNode,
  cart,
  handleUpdateQuantity,
  handleRemoveFromCart,
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
}) => {
  return (
    <section className="w-full lg:w-[35%] bg-[#1a1d21] border-l border-outline/10 flex flex-col rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div className="px-md py-md border-b border-[#2d3238] bg-[#1a1d21] sticky top-0 z-10 flex-shrink-0">
        <h2 className="font-headline-md text-headline-md text-white font-bold">Đơn hàng hiện tại</h2>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
        {/* Customer CRM section injected here */}
        {customerSelectionNode}

        {/* Line Items List */}
        <div className="flex-1 flex flex-col gap-sm">
          <h4 className="font-label-caps text-label-caps text-outline uppercase mb-1">
            Sản phẩm đã chọn ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </h4>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-outline/50 border-2 border-dashed border-outline/10 rounded-xl">
              <span className="material-symbols-outlined text-3xl mb-1">shopping_cart</span>
              <p className="text-xs font-semibold">Giỏ hàng đang trống</p>
            </div>
          ) : (
            <div className="space-y-sm max-h-[300px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.variant.id} className="flex gap-sm bg-inverse-surface border border-outline/10 rounded-lg p-sm relative group/item">
                  <div className="w-12 h-16 rounded bg-surface-container-low flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                      <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-xl">checkroom</span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start gap-sm">
                      <div>
                        <h5 className="font-body-sm text-body-sm text-on-tertiary font-bold line-clamp-1">{item.product.name}</h5>
                        <p className="text-[10px] text-outline mt-0.5 uppercase tracking-wide">
                          SKU: {item.variant.sku}
                          {item.variant.option1Value ? ` | ${item.variant.option1Value.value}` : ''}
                          {item.variant.option2Value ? ` - ${item.variant.option2Value.value}` : ''}
                        </p>
                      </div>
                      <span className="font-title-sm text-title-sm text-on-tertiary font-bold whitespace-nowrap">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.variant.salePrice * item.quantity)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Quantity control */}
                      <div className="flex items-center gap-3 bg-[#3d4247] rounded-lg px-2.5 py-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.variant.id as number, -1)}
                          className="text-outline hover:text-on-tertiary flex items-center"
                        >
                          <span className="material-symbols-outlined text-[14px] font-bold">remove</span>
                        </button>
                        <span className="font-body-sm text-on-tertiary w-4 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.variant.id as number, 1)}
                          className="text-outline hover:text-on-tertiary flex items-center"
                        >
                          <span className="material-symbols-outlined text-[14px] font-bold">add</span>
                        </button>
                      </div>

                      {/* Delete item */}
                      <button
                        onClick={() => handleRemoveFromCart(item.variant.id as number)}
                        className="text-outline hover:text-error transition-colors p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Footer Section */}
      <div className="p-md border-t border-outline/20 bg-[#15181c] flex-shrink-0">
        {/* Payment Fields */}
        <div className="space-y-sm mb-4">
          <div className="grid grid-cols-2 gap-sm">
            <Input
              label="Khách trả tiền"
              type="number"
              placeholder="0"
              value={customerPaid}
              onChange={(e) => {
                setIsPaidModified(true);
                setCustomerPaid(e.target.value === '' ? '' : Number(e.target.value));
              }}
              error={customerPaid !== '' && customerPaid < total ? 'Khách trả chưa đủ tiền' : undefined}
              className="bg-[#16191c] border-[#2d3238] text-white"
            />
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tiền trả lại</label>
              <div className="w-full bg-[#16191c]/50 border border-[#2d3238] rounded-lg px-3 py-2 text-xs text-[#2ecc71] font-bold h-[34px] flex items-center">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(changeAmount)}
              </div>
            </div>
          </div>
          <Input
            type="text"
            placeholder="Ghi chú đơn hàng..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-[16px]">edit_note</span>}
            className="bg-[#16191c] border-[#2d3238] text-white placeholder:text-slate-500"
          />
        </div>

        {/* Financial Details */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>Tạm tính</span>
            <span className="text-white">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>Thuế (VAT 8%)</span>
            <span className="text-white">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tax)}</span>
          </div>

          {/* Point discount rendering */}
          {customerType === 'MEMBER' && pointsDiscount > 0 && (
            <div className="flex justify-between items-center text-[#2ecc71] text-xs font-semibold">
              <span>Dùng điểm tích lũy ({pointsToUse} điểm)</span>
              <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointsDiscount)}</span>
            </div>
          )}

          {/* Voucher discount rendering */}
          {customerType === 'MEMBER' && voucherDiscount > 0 && (
            <div className="flex justify-between items-center text-[#2ecc71] text-xs font-semibold">
              <span>Voucher giảm giá ({voucherCode})</span>
              <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucherDiscount)}</span>
            </div>
          )}

          <div className="h-px bg-outline/20 w-full my-0.5"></div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-white font-bold">Tổng cộng</span>
            <span className="text-xl font-extrabold text-[#f1c40f] tracking-tight">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
            </span>
          </div>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handleCheckout}
          disabled={isCreatingOrder || cart.length === 0}
          className="w-full py-4 bg-[#2ecc71] hover:bg-[#2ecc71]/90 text-white rounded-xl font-bold transition-all border-none"
          size="lg"
          leftIcon={isCreatingOrder ? (
            <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">credit_card</span>
          )}
        >
          {isCreatingOrder ? 'Đang xử lý thanh toán...' : 'Thanh toán & Xuất hóa đơn'}
        </Button>
      </div>
    </section>
  );
};
