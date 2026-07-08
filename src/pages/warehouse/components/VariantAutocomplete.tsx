import { useState, useRef, useEffect, useMemo } from 'react';
import { useGetProductsQuery } from '@/redux/api/productApi';
import type { ProductVariant } from '@/types/product.types';

export interface VariantOption {
    variantId: number;
    productName: string;
    sku: string;
    option1?: string;
    option2?: string;
    option3?: string;
    salePrice: number;
    importPrice?: number;
    quantity: number;
}

interface VariantAutocompleteProps {
    onSelect: (variant: VariantOption) => void;
    placeholder?: string;
}

export default function VariantAutocomplete({
    onSelect,
    placeholder = 'Tìm theo tên sản phẩm hoặc SKU...',
}: VariantAutocompleteProps) {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch toàn bộ products (size lớn để tìm kiếm client-side)
    const { data: pageData } = useGetProductsQuery({
        search: inputValue.length >= 1 ? inputValue : undefined,
        size: 50,
        isDeleted: false,
    });

    const allVariants: VariantOption[] = useMemo(() => {
        const products = pageData?.data?.content ?? [];
        const result: VariantOption[] = [];
        for (const product of products) {
            for (const variant of product.variants.filter(v => v.isActive !== false)) {
                result.push({
                    variantId: variant.id as number,
                    productName: product.name,
                    sku: variant.sku,
                    option1: variant.option1Value?.value,
                    option2: variant.option2Value?.value,
                    option3: variant.option3Value?.value,
                    salePrice: variant.salePrice,
                    importPrice: variant.importPrice,
                    quantity: variant.quantity,
                });
            }
        }
        return result;
    }, [pageData]);

    // Filter client-side theo SKU, tên sản phẩm
    const filtered = useMemo(() => {
        if (!inputValue.trim()) return [];
        const q = inputValue.toLowerCase();
        return allVariants.filter(
            (v) =>
                v.sku.toLowerCase().includes(q) ||
                v.productName.toLowerCase().includes(q)
        );
    }, [allVariants, inputValue]);

    // Close dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (variant: VariantOption) => {
        onSelect(variant);
        setInputValue('');
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    search
                </span>
                <input
                    type="text"
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => inputValue.length > 0 && setIsOpen(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                />
            </div>

            {/* Dropdown */}
            {isOpen && filtered.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-surface border border-outline/20 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                    {filtered.map((v) => {
                        const variantLabel = [v.option1, v.option2, v.option3].filter(Boolean).join(' / ');
                        return (
                            <button
                                key={v.variantId}
                                type="button"
                                onClick={() => handleSelect(v)}
                                className="w-full text-left px-4 py-3 hover:bg-surface-variant/30 transition-colors border-b border-outline/5 last:border-0 flex items-start gap-3"
                            >
                                {/* Icon sản phẩm */}
                                <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px] mt-0.5 flex-shrink-0">
                                    checkroom
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-on-surface truncate">
                                        {v.productName}
                                        {variantLabel && (
                                            <span className="ml-2 text-primary font-semibold">[{variantLabel}]</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-on-surface-variant">
                                            SKU: <span className="font-mono font-semibold">{v.sku}</span>
                                        </span>
                                        <span className="text-xs text-on-surface-variant">
                                            Tồn: <span className={`font-semibold ${v.quantity <= 0 ? 'text-error' : 'text-primary'}`}>{v.quantity}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    {v.importPrice ? (
                                        <div className="text-xs text-on-surface-variant">
                                            Giá nhập: <span className="font-semibold text-on-surface">
                                                {new Intl.NumberFormat('vi-VN').format(v.importPrice)}đ
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
            {isOpen && inputValue.length > 0 && filtered.length === 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-surface border border-outline/20 rounded-xl shadow-xl p-4 text-center text-sm text-on-surface-variant">
                    Không tìm thấy sản phẩm nào khớp với "<span className="font-semibold">{inputValue}</span>"
                </div>
            )}
        </div>
    );
}
