import React from 'react';
import type { Product, ProductVariant } from '@/types/product.types';

interface VariantSelectorModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant) => void;
}

export const VariantSelectorModal: React.FC<VariantSelectorModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest border border-outline/10 rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-md border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Chọn phân loại</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-md space-y-sm">
          {product.variants?.map((v) => {
            const isVarOutOfStock = (v.quantity || 0) <= 0;
            const priceStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.salePrice);

            // Construct variant options string (e.g. Size M - Màu Đỏ)
            const optionsStr = [
              v.option1Value?.value,
              v.option2Value?.value,
              v.option3Value?.value
            ].filter(Boolean).join(' - ');

            return (
              <div
                key={v.id}
                onClick={() => !isVarOutOfStock && onAddToCart(product, v)}
                className={`flex justify-between items-center p-md border rounded-xl transition-all duration-300 cursor-pointer ${isVarOutOfStock ? 'bg-surface-container-low opacity-40 cursor-not-allowed border-outline/5' : 'bg-surface hover:border-primary/50 hover:bg-surface-container-lowest border-outline/10'}`}
              >
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">{optionsStr || 'Mặc định'}</h4>
                  <p className="text-xs text-on-surface-variant/75 mt-0.5">SKU: {v.sku} • Kho: {v.quantity}</p>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="text-sm font-bold text-primary">{priceStr}</span>
                  <button
                    disabled={isVarOutOfStock}
                    className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
