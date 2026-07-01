import React from 'react';
import type { CartItem } from '../useOrderCreate';

interface CartItemsListProps {
  cart: CartItem[];
  handleUpdateQuantity: (variantId: number, delta: number) => void;
  handleRemoveFromCart: (variantId: number) => void;
}

export function CartItemsList({
  cart,
  handleUpdateQuantity,
  handleRemoveFromCart
}: CartItemsListProps) {
  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
          <span className="material-symbols-outlined text-4xl text-gray-300">inbox</span>
        </div>
        <h3 className="text-sm font-bold text-gray-700">Giỏ hàng của bạn đang trống</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
          Vui lòng quét mã barcode hoặc nhấn phím <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] text-gray-500 font-bold mx-0.5 shadow-sm">F3</kbd> để tìm và chọn sản phẩm đưa vào đơn.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 flex flex-col">
      {cart.map((item) => {
        const itemTotal = item.variant.salePrice * item.quantity;
        const priceFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.variant.salePrice);
        const totalFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemTotal);

        return (
          <div
            key={item.variant.id}
            className="p-3.5 flex justify-between items-center transition-colors hover:bg-gray-50/50"
          >
            {/* Product details */}
            <div className="flex-1 min-w-0 flex gap-3 items-center">
              {/* Fallback image */}
              <div className="w-10 h-12 bg-gray-50 border border-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                  <img
                    src={item.product.imageUrls[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-gray-300 text-lg">checkroom</span>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate" title={item.product.name}>
                  {item.product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono text-gray-500 bg-gray-100 px-1 py-0.2 rounded font-semibold uppercase">
                    {item.variant.sku}
                  </span>
                  {item.variant.option1Value && (
                    <span className="text-[10px] text-gray-500 font-medium">
                      {item.variant.option1Value.value}
                    </span>
                  )}
                  {item.variant.option2Value && (
                    <span className="text-[10px] text-gray-500 font-medium">
                      - {item.variant.option2Value.value}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Unit Price */}
            <div className="w-28 text-right text-xs font-bold text-gray-800">
              {priceFmt}
            </div>

            {/* Quantity Selector */}
            <div className="w-32 flex justify-center items-center gap-1 select-none">
              <button
                onClick={() => handleUpdateQuantity(item.variant.id!, -1)}
                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm transition-all"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-xs text-gray-800">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.variant.id!, 1)}
                disabled={item.quantity >= (item.variant.quantity || 999)}
                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                +
              </button>
            </div>

            {/* Total Line Price */}
            <div className="w-28 text-right text-xs font-extrabold text-blue-600">
              {totalFmt}
            </div>

            {/* Remove Button */}
            <div className="w-12 text-center">
              <button
                onClick={() => handleRemoveFromCart(item.variant.id!)}
                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"
                title="Xóa dòng"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
