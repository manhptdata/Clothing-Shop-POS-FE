import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import type { Product, ProductVariant } from '@/types/product.types';

interface ProductSearchAutocompleteProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleAddToCart: (product: Product, variant: ProductVariant) => void;
  handleProductClick: (product: Product) => void;
  handleBarcodeScan: (barcode: string) => boolean;
}

export const ProductSearchAutocomplete: React.FC<ProductSearchAutocompleteProps> = ({
  products,
  searchQuery,
  setSearchQuery,
  handleAddToCart,
  handleProductClick,
  handleBarcodeScan,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Focus the input using global F3 key shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter products and gather all variants as options
  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const results: { product: Product; variant: ProductVariant }[] = [];

    for (const product of products) {
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          const nameMatches = product.name.toLowerCase().includes(query);
          const skuMatches = variant.sku?.toLowerCase().includes(query);
          if (nameMatches || skuMatches) {
            results.push({ product, variant });
          }
        }
      }
    }
    return results.slice(0, 15); // limit to 15 suggestions
  };

  const suggestions = getSuggestions();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation inside suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        selectSuggestion(suggestions[highlightedIndex]);
      } else if (searchQuery.trim()) {
        // Try direct barcode scan
        const scanned = handleBarcodeScan(searchQuery);
        if (scanned) {
          setSearchQuery('');
          setIsOpen(false);
        } else if (suggestions.length === 1) {
          selectSuggestion(suggestions[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectSuggestion = (item: { product: Product; variant: ProductVariant }) => {
    if (item.variant.quantity <= 0) {
      toast.error(`Sản phẩm ${item.product.name} (SKU: ${item.variant.sku}) đã hết hàng!`);
      return;
    }
    handleAddToCart(item.product, item.variant);
    setSearchQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-[450px]">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] select-none">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Nhập tên sản phẩm hoặc mã SKU... [F3]"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-1.5 bg-gray-50 hover:bg-white focus:bg-white text-gray-900 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-lg text-sm transition-all placeholder:text-gray-400"
        />
        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center h-4.5 px-1 bg-gray-100 border border-gray-200 rounded text-[9px] text-gray-500 font-bold select-none">
            F3
          </kbd>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[350px] overflow-y-auto divide-y divide-gray-100"
        >
          {suggestions.map((item, index) => {
            const isHighlighted = index === highlightedIndex;
            const priceFmt = new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(item.variant.salePrice);

            return (
              <div
                key={item.variant.id}
                onClick={() => selectSuggestion(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`p-3 cursor-pointer flex gap-3 items-center transition-colors ${
                  isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Variant Image */}
                <div className="w-10 h-12 bg-gray-50 border border-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                    <img
                      src={item.product.imageUrls[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-gray-300 text-lg">
                      checkroom
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1 py-0.2 rounded font-semibold uppercase">
                      SKU: {item.variant.sku}
                    </span>
                    {item.variant.option1Value && (
                      <span className="text-[10px] text-gray-600 font-medium">
                        {item.variant.option1Value.value}
                      </span>
                    )}
                    {item.variant.option2Value && (
                      <span className="text-[10px] text-gray-600 font-medium">
                        - {item.variant.option2Value.value}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Stock */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-blue-600">{priceFmt}</div>
                  <div
                    className={`text-[10px] font-semibold mt-0.5 ${
                      item.variant.quantity <= 0
                        ? 'text-red-500'
                        : item.variant.quantity <= 5
                        ? 'text-orange-500'
                        : 'text-gray-500'
                    }`}
                  >
                    Tồn: {item.variant.quantity}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
