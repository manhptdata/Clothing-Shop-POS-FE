import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { ProductVariant } from '@/types/product.types';
import { useAppSelector } from '@/redux/hooks';

interface ProductTableProps {
    products: any[];
    getVariantStatus: (quantity: number, threshold?: number) => any;
    onDelete: (id: number, name: string) => void;
    searchQuery?: string;
}

export default function ProductTable({ products, getVariantStatus, onDelete, searchQuery = '' }: ProductTableProps) {
    const { user } = useAppSelector((state) => state.auth);
    const userPerms = user?.permissions || [];
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const hasManageProductPermission = isAdmin || userPerms.includes('MANAGE_PRODUCT');

    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    // Tự động mở row nếu đang search và SKU có match
    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const matchedIds: number[] = [];
            products.forEach(p => {
                const variants = p.variants || [];
                const hasMatch = variants.some((v: any) => v.sku?.toLowerCase().includes(query));
                if (hasMatch) {
                    matchedIds.push(p.id);
                }
            });
            setExpandedRows(prev => Array.from(new Set([...prev, ...matchedIds])));
        }
    }, [products, searchQuery]);

    const toggleRow = (id: number) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl block mb-2">inbox</span>
                <p>Không tìm thấy sản phẩm nào</p>
                <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest rounded-lg border border-outline/20 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-surface-container border-b border-outline/10">
                        <tr>
                            <th className="w-12 px-4 py-3"></th>
                            <th className="text-left px-4 py-3 text-label-caps text-on-surface-variant/80 uppercase font-semibold text-xs tracking-wider">Sản phẩm</th>
                            <th className="text-left px-4 py-3 text-label-caps text-on-surface-variant/80 uppercase font-semibold text-xs tracking-wider">Danh mục</th>
                            <th className="text-right px-4 py-3 text-label-caps text-on-surface-variant/80 uppercase font-semibold text-xs tracking-wider">Tồn kho</th>
                            <th className="text-center px-4 py-3 text-label-caps text-on-surface-variant/80 uppercase font-semibold text-xs tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/10">
                        {products.map((product: any) => {
                            const variants = product.variants || [];
                            const activeVariants = variants.filter((v: any) => v.isActive !== false);
                            const totalQuantity = activeVariants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0);
                            const isExpanded = expandedRows.includes(product.id);
                            const query = searchQuery.toLowerCase().trim();

                            return (
                                <React.Fragment key={product.id}>
                                    {/* Dòng chính (Sản phẩm cha) */}
                                    <tr className={`hover:bg-surface-container/30 transition-colors ${isExpanded ? 'bg-primary/5' : ''} ${product.isDeleted ? 'opacity-50 bg-error-container/10' : ''}`}>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => toggleRow(product.id)}
                                                className={`p-1.5 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center ${isExpanded ? 'text-primary bg-primary/10' : 'text-on-surface-variant'}`}
                                                title={isExpanded ? "Thu gọn" : "Xem biến thể"}
                                            >
                                                <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                                    chevron_right
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0 overflow-hidden border border-outline/10 shadow-sm">
                                                    {product.imageUrls && product.imageUrls.length > 0 ? (
                                                        <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-2xl text-gray-300">checkroom</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <Link to={`/products/${product.id}`} className="font-title-sm text-title-sm text-on-surface hover:text-primary transition-colors font-semibold">
                                                        {product.name}
                                                    </Link>
                                                    <div className="text-xs text-on-surface-variant/70 mt-0.5 font-medium">
                                                        {activeVariants.length} biến thể
                                                        {product.isDeleted && <span className="ml-2 text-error font-bold">[Đã xóa]</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant border border-outline/5">
                                                {product.category?.name || 'Chưa phân loại'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="font-mono font-bold text-sm text-on-surface">{totalQuantity}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link to={`/products/${product.id}`} className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors" title="Xem chi tiết">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </Link>
                                                {hasManageProductPermission && !product.isDeleted && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(product.id, product.name)}
                                                        className="p-1.5 rounded-md hover:bg-error-container/50 text-on-surface-variant hover:text-error transition-colors"
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Dòng con (Bảng Variant xổ xuống) */}
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={5} className="p-0 border-b border-outline/10 bg-surface-container-lowest">
                                                <div className="py-2 pr-6 pl-[68px]">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-xs text-on-surface-variant/50 border-b border-outline/10">
                                                                <th className="text-left font-semibold py-2 w-1/3">THUỘC TÍNH</th>
                                                                <th className="text-left font-semibold py-2 w-1/4">SKU</th>
                                                                <th className="text-right font-semibold py-2 w-1/5">GIÁ BÁN</th>
                                                                <th className="text-right font-semibold py-2">TỒN KHO</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-outline/5">
                                                            {activeVariants.map((variant: ProductVariant, idx: number) => {
                                                                const variantStatus = getVariantStatus(variant.quantity || 0, variant.lowStockThreshold || 10);
                                                                const optionValues = [variant.option1Value, variant.option2Value, variant.option3Value]
                                                                    .filter(Boolean)
                                                                    .join(' / ');
                                                                
                                                                const isMatchSearch = query && variant.sku?.toLowerCase().includes(query);
                                                                const priceFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.salePrice);

                                                                return (
                                                                    <tr key={variant.id || idx} className={`hover:bg-surface-container/30 transition-colors ${isMatchSearch ? 'bg-warning/10' : ''}`}>
                                                                        <td className="py-2.5 text-on-surface text-[13px] font-medium">
                                                                            {optionValues || 'Mặc định'}
                                                                        </td>
                                                                        <td className="py-2.5">
                                                                            <span className={`font-mono text-xs ${isMatchSearch ? 'text-warning font-bold' : 'text-on-surface-variant'}`}>
                                                                                {variant.sku || 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-semibold text-on-surface text-[13px]">
                                                                            {priceFmt}
                                                                        </td>
                                                                        <td className="py-2.5 text-right">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                                                                    variantStatus.class === 'critical' ? 'bg-error' :
                                                                                    variantStatus.class === 'low' ? 'bg-warning' :
                                                                                    'bg-success'
                                                                                }`}></span>
                                                                                <span className={`font-mono text-[13px] ${
                                                                                    variantStatus.class === 'critical' ? 'text-error font-bold' :
                                                                                    variantStatus.class === 'low' ? 'text-warning font-bold' :
                                                                                    'text-on-surface-variant font-medium'
                                                                                }`}>
                                                                                    {variant.quantity || 0}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}