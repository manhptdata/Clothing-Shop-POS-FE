import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { ProductVariant } from '@/types/product.types';
import { useAppSelector } from '@/redux/hooks';

interface ProductTableProps {
    products: any[];
    getVariantStatus: (quantity: number, threshold?: number) => any;
    onDelete: (id: number, name: string) => void;
}

export default function ProductTable({ products, getVariantStatus, onDelete }: ProductTableProps) {
    const { user } = useAppSelector((state) => state.auth);
    const userPerms = user?.permissions || [];
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const hasManageProductPermission = isAdmin || userPerms.includes('MANAGE_PRODUCT');

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
        <div className="bg-surface-container-lowest rounded-lg border border-outline/20 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-surface-container">
                        <tr>
                            <th className="text-left px-4 py-3 text-label-caps text-on-surface-variant/80 uppercase font-semibold text-xs tracking-wider">Sản phẩm</th>
                            <th className="text-left px-4 py-3 text-label-caps text-on-surface-variant/80 uppercase font-semibold text-xs tracking-wider">Danh mục</th>
                            <th className="text-left px-4 py-3 text-label-caps text-on-surface-variant/80 uppercase font-semibold text-xs tracking-wider">Biến thể - Tồn kho</th>
                            <th className="text-left px-4 py-3 text-label-caps text-on-surface-variant/80 uppercase font-semibold text-xs tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/10">
                        {products.map((product: any) => {
                            const variants = product.variants || [];
                            const displayVariants = variants.slice(0, 3);
                            const hasMore = variants.length > 3;

                            return (
                                <tr key={product.id} className={`hover:bg-surface-container/50 transition-colors ${product.isDeleted ? 'opacity-50 bg-error-container/10' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0 overflow-hidden border border-outline/10">
                                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-contain p-0.5" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-2xl">checkroom</span>
                                                )}
                                            </div>
                                            <div>
                                                <Link to={`/products/${product.id}`} className="font-title-sm text-title-sm text-on-surface hover:text-primary transition-colors">
                                                    {product.name}
                                                </Link>
                                                <div className="text-xs text-on-surface-variant/70 mt-0.5">
                                                    {variants.length} biến thể
                                                    {product.isDeleted && <span className="ml-2 text-error font-medium">[Đã xóa]</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-block px-2 py-0.5 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">
                                            {product.category?.name || 'Chưa phân loại'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <table className="w-fit border-separate" style={{ borderSpacing: '0 4px', marginTop: '-4px' }}>
                                            <tbody>
                                                {displayVariants.map((variant: ProductVariant, idx: number) => {
                                                    const variantStatus = getVariantStatus(variant.quantity || 0, variant.lowStockThreshold || 10);
                                                    const quantity = variant.quantity || 0;
                                                    const optionValues = [variant.option1Value, variant.option2Value, variant.option3Value]
                                                        .filter(Boolean)
                                                        .join(' / ');

                                                    const bgClass = variantStatus.class === 'critical' ? 'bg-error-container/20' :
                                                        variantStatus.class === 'low' ? 'bg-warning-container/20' :
                                                            'bg-surface-container';

                                                    const textColorClass = variantStatus.class === 'critical' ? 'text-error' :
                                                        variantStatus.class === 'low' ? 'text-warning' :
                                                            'text-success';

                                                    return (
                                                        <tr key={idx} className={`text-xs transition-colors hover:brightness-95`}>
                                                            <td className={`px-2 py-1 rounded-l whitespace-nowrap ${bgClass} ${variantStatus.class !== 'ok' ? `border-l-2 ${variantStatus.class === 'critical' ? 'border-error' : 'border-warning'}` : ''}`}>
                                                                <span className="font-medium text-on-surface">
                                                                    {optionValues || `Biến thể ${idx + 1}`}
                                                                </span>
                                                            </td>
                                                            <td className={`px-2 py-1 font-semibold whitespace-nowrap ${bgClass} ${textColorClass}`}>
                                                                <div className="flex items-center gap-1 justify-end">
                                                                    <span className="text-on-surface-variant/50">:</span>
                                                                    <span className="inline-block min-w-[20px] text-right">{quantity}</span>
                                                                </div>
                                                            </td>
                                                            <td className={`px-2 py-1 rounded-r whitespace-nowrap ${bgClass}`}>
                                                                <div className="flex items-center gap-1.5 justify-start">
                                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${variantStatus.class === 'critical' ? 'bg-error' :
                                                                        variantStatus.class === 'low' ? 'bg-warning' :
                                                                            'bg-success'
                                                                        }`}></span>
                                                                    {variantStatus.class !== 'ok' && (
                                                                        <span className={`text-[10px] font-medium ${textColorClass}`}>
                                                                            {variantStatus.label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {hasMore && (
                                            <div className="text-xs text-on-surface-variant/60 px-2 mt-1">
                                                +{variants.length - 3} biến thể khác
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/products/${product.id}`} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors" title="Xem chi tiết">
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                            </Link>
                                            {hasManageProductPermission && !product.isDeleted && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(product.id, product.name)}
                                                    className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors"
                                                    title="Xóa sản phẩm"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}