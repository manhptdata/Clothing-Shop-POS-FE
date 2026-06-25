import React from 'react';
import type { Product } from '@/types/product.types';
import type { CartItem } from '../useOrderCreate';

interface ProductCatalogProps {
  isProductsLoading: boolean;
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  filteredProducts: Product[];
  cart: CartItem[];
  handleProductClick: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  isProductsLoading,
  categories,
  activeCategory,
  setActiveCategory,
  filteredProducts,
  cart,
  handleProductClick,
}) => {
  return (
    <section className="w-full lg:w-[65%] flex flex-col h-full overflow-hidden">
      {/* Filters */}
      <div className="flex gap-sm overflow-x-auto pb-2 mb-md scrollbar-none flex-shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg font-button text-button whitespace-nowrap transition-all duration-300 ${activeCategory === cat ? 'bg-primary text-on-primary shadow-sm scale-102' : 'border border-outline/10 text-on-surface-variant hover:border-primary/50 hover:text-primary bg-surface/50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-md content-start">
        {isProductsLoading ? (
          <div className="col-span-full py-16 text-center text-on-surface-variant/75">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
            <p className="text-body-md font-medium">Đang tải danh sách sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-on-surface-variant/75">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">inventory_2</span>
            <p className="text-body-md">Không tìm thấy sản phẩm nào trong danh mục này.</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            // Get display price from first variant
            const firstVar = p.variants?.[0];
            const displayPrice = firstVar ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(firstVar.salePrice) : 'Liên hệ';
            const totalStock = p.variants?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0;
            const isOutOfStock = totalStock === 0;

            // Check if any variant is currently in the cart
            const cartQty = cart.filter(item => item.product.id === p.id).reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && handleProductClick(p)}
                className={`group border rounded-xl overflow-hidden bg-surface-container-lowest cursor-pointer flex flex-col relative transition-all duration-300 ${cartQty > 0 ? 'border-primary shadow-[0_4px_12px_rgba(27,138,84,0.08)]' : 'border-outline/10 hover:border-primary/50 hover:shadow-sm'} ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="aspect-[4/5] bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                  {p.imageUrls && p.imageUrls.length > 0 ? (
                    <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">checkroom</span>
                  )}

                  {cartQty > 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-on-primary px-2.5 py-1 rounded-full flex items-center gap-1 z-10 shadow-sm">
                      <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                      <span className="text-[10px] font-semibold">{cartQty} trong giỏ</span>
                    </div>
                  )}

                  <div className={`absolute top-2 right-2 bg-surface-container-lowest/90 px-2 py-0.5 rounded text-[10px] font-semibold border ${isOutOfStock ? 'text-error border-error/20 bg-error-container' : 'text-on-surface-variant border-outline/10'}`}>
                    {isOutOfStock ? 'Hết hàng' : `Kho: ${totalStock}`}
                  </div>
                </div>

                <div className="p-sm flex flex-col flex-1 justify-between gap-xs">
                  <div>
                    <h3 className="font-body-sm text-body-sm font-semibold text-on-background line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                    <p className="font-label-caps text-label-caps text-on-surface-variant/75 mt-0.5">{p.category?.name || 'Phân loại chung'}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-xs border-t border-outline/5">
                    <span className="font-title-sm text-title-sm text-primary font-bold">{displayPrice}</span>
                    <button
                      disabled={isOutOfStock}
                      className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
