import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useGetSuppliersQuery } from '@/redux/api/supplierApi';
import { useCreateReceiptMutation } from '@/redux/api/receiptApi';
import VariantAutocomplete, { type VariantOption } from './components/VariantAutocomplete';
import SupplierFormModal from '@/pages/suppliers/components/SupplierFormModal';
import ProductFormModal from '@/pages/products/components/ProductFormModal';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import type { Product } from '@/types/product.types';

interface ReceiptLine {
    key: string; // unique key for react
    variantId: number;
    productName: string;
    sku: string;
    variantLabel: string;
    quantity: number;
    importPrice: number;
}

const fmtCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export default function ReceiptCreatePage() {
    const navigate = useNavigate();

    const [supplierId, setSupplierId] = useState<number | ''>('');
    const [note, setNote] = useState('');
    const [lines, setLines] = useState<ReceiptLine[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Modal states
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const { data: supplierPage } = useGetSuppliersQuery({ size: 200, isActive: true });
    const suppliers = supplierPage?.content ?? [];
    
    const { data: categories = [] } = useGetCategoriesQuery();

    const [createReceipt, { isLoading }] = useCreateReceiptMutation();

    // Thêm variant từ autocomplete
    const handleSelectVariant = (variant: VariantOption) => {
        const existing = lines.find((l) => l.variantId === variant.variantId);
        if (existing) {
            // Tăng số lượng nếu đã có
            setLines((prev) =>
                prev.map((l) =>
                    l.variantId === variant.variantId ? { ...l, quantity: l.quantity + 1 } : l
                )
            );
            return;
        }
        const variantLabel = [variant.option1, variant.option2, variant.option3].filter(Boolean).join(' / ');
        setLines((prev) => [
            ...prev,
            {
                key: `${variant.variantId}-${Date.now()}`,
                variantId: variant.variantId,
                productName: variant.productName,
                sku: variant.sku,
                variantLabel,
                quantity: 1,
                importPrice: variant.importPrice ?? 0,
            },
        ]);
    };

    const handleUpdateLine = (key: string, field: 'quantity' | 'importPrice', value: number) => {
        setLines((prev) =>
            prev.map((l) => (l.key === key ? { ...l, [field]: value } : l))
        );
    };

    const handleRemoveLine = (key: string) => {
        setLines((prev) => prev.filter((l) => l.key !== key));
    };

    const totalQty = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
    const totalAmount = useMemo(
        () => lines.reduce((s, l) => s + l.quantity * l.importPrice, 0),
        [lines]
    );

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!supplierId) newErrors.supplierId = 'Vui lòng chọn nhà cung cấp';
        if (lines.length === 0) newErrors.items = 'Vui lòng thêm ít nhất 1 sản phẩm';
        lines.forEach((l) => {
            if (l.quantity <= 0) newErrors[`qty_${l.key}`] = 'SL > 0';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveDraft = async () => {
        if (!validate()) return;
        try {
            const receipt = await createReceipt({
                supplierId: supplierId as number,
                note: note || undefined,
                items: lines.map((l) => ({
                    variantId: l.variantId,
                    quantity: l.quantity,
                    importPrice: l.importPrice > 0 ? l.importPrice : undefined,
                })),
            }).unwrap();
            navigate(`/warehouse/receipts/${receipt.id}`);
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || 'Lỗi khi tạo phiếu nhập');
        }
    };

    const handleProductCreated = (product: Product) => {
        if (!product.variants || product.variants.length === 0) return;
        setLines((prev) => {
            const newLines = [...prev];
            product.variants.forEach((v) => {
                const existing = newLines.find((l) => l.variantId === v.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    const variantLabel = [v.option1Value?.value, v.option2Value?.value, v.option3Value?.value].filter(Boolean).join(' / ');
                    newLines.push({
                        key: `${v.id}-${Date.now()}-${Math.random()}`,
                        variantId: v.id as number,
                        productName: product.name,
                        sku: v.sku,
                        variantLabel,
                        quantity: 1,
                        importPrice: v.importPrice ?? 0,
                    });
                }
            });
            return newLines;
        });
    };

    return (
        <div className="max-w-[1200px] mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/warehouse/receipts')}
                    className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-variant/30"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-display-lg text-on-surface tracking-tighter" style={{ fontSize: '28px', lineHeight: '36px' }}>
                        Tạo phiếu nhập kho
                    </h2>
                    <p className="text-sm text-on-surface-variant">Điền thông tin và thêm sản phẩm cần nhập</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Thông tin phiếu */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-surface rounded-xl border border-outline/10 p-5">
                        <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                            Thông tin phiếu
                        </h3>

                        {/* Nhà cung cấp */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-on-surface">
                                    Nhà cung cấp <span className="text-error">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsSupplierModalOpen(true)}
                                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
                                >
                                    <span className="material-symbols-outlined text-[14px]">add</span> Thêm mới
                                </button>
                            </div>
                            <select
                                value={supplierId}
                                onChange={(e) => {
                                    setSupplierId(e.target.value ? Number(e.target.value) : '');
                                    setErrors((prev) => ({ ...prev, supplierId: '' }));
                                }}
                                className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-1 text-sm transition-all ${
                                    errors.supplierId
                                        ? 'border-error focus:border-error focus:ring-error/20'
                                        : 'border-outline/20 focus:border-primary focus:ring-primary/20'
                                }`}
                            >
                                <option value="">-- Chọn nhà cung cấp --</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.phone ? `- ${s.phone}` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.supplierId && <p className="mt-1 text-xs text-error">{errors.supplierId}</p>}
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1">Ghi chú</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={4}
                                placeholder="Nhập ghi chú phiếu nhập (nếu có)..."
                                className="w-full px-3 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm resize-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Tóm tắt */}
                    <div className="bg-surface rounded-xl border border-outline/10 p-5">
                        <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                            Tóm tắt
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">Số dòng sản phẩm</span>
                                <span className="font-medium">{lines.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">Tổng số lượng</span>
                                <span className="font-medium">{totalQty}</span>
                            </div>
                            <div className="h-px bg-outline/10 my-2" />
                            <div className="flex justify-between">
                                <span className="font-semibold text-on-surface">Tổng tiền nhập</span>
                                <span className="font-bold text-primary">{fmtCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column: Danh sách sản phẩm */}
                <div className="lg:col-span-2">
                    <div className="bg-surface rounded-xl border border-outline/10 p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
                                Sản phẩm nhập kho
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsProductModalOpen(true)}
                                className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
                            >
                                <span className="material-symbols-outlined text-[14px]">add</span> Tạo mới sản phẩm
                            </button>
                        </div>

                        {/* Autocomplete search */}
                        <div className="mb-4">
                            <VariantAutocomplete
                                onSelect={handleSelectVariant}
                                placeholder="Gõ tên sản phẩm hoặc SKU để thêm..."
                            />
                            {errors.items && <p className="mt-1 text-xs text-error">{errors.items}</p>}
                        </div>

                        {/* Bảng sản phẩm đã thêm */}
                        {lines.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-outline/10 rounded-xl">
                                <span className="material-symbols-outlined text-3xl text-outline/40 mb-2">add_shopping_cart</span>
                                <p className="text-sm text-on-surface-variant">Tìm và thêm sản phẩm vào phiếu nhập ở trên</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-outline/10">
                                            <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Sản phẩm</th>
                                            <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide text-right w-24">Số lượng</th>
                                            <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide text-right w-32">Giá nhập (đ)</th>
                                            <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide text-right w-28">Thành tiền</th>
                                            <th className="pb-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline/5">
                                        {lines.map((line) => (
                                            <tr key={line.key} className="group">
                                                <td className="py-3 pr-4">
                                                    <div className="font-medium text-sm text-on-surface">{line.productName}</div>
                                                    <div className="text-xs text-on-surface-variant mt-0.5">
                                                        SKU: <span className="font-mono">{line.sku}</span>
                                                        {line.variantLabel && <span className="ml-2 text-primary">[{line.variantLabel}]</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={line.quantity}
                                                        onChange={(e) => handleUpdateLine(line.key, 'quantity', Math.max(1, Number(e.target.value)))}
                                                        className="w-20 text-right px-2 py-1 border border-outline/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                                                    />
                                                    {errors[`qty_${line.key}`] && (
                                                        <p className="text-xs text-error mt-0.5">{errors[`qty_${line.key}`]}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={line.importPrice}
                                                        onChange={(e) => handleUpdateLine(line.key, 'importPrice', Number(e.target.value))}
                                                        className="w-28 text-right px-2 py-1 border border-outline/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="py-3 text-right font-semibold text-sm text-on-surface">
                                                    {fmtCurrency(line.quantity * line.importPrice)}
                                                </td>
                                                <td className="py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLine(line.key)}
                                                        className="text-on-surface-variant hover:text-error transition-colors p-1 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-outline/10">
                                            <td colSpan={2} className="pt-3 text-sm text-on-surface-variant">
                                                Tổng: <span className="font-semibold text-on-surface">{totalQty} sản phẩm</span>
                                            </td>
                                            <td className="pt-3 text-right text-xs text-on-surface-variant uppercase tracking-wide">Tổng tiền:</td>
                                            <td className="pt-3 text-right font-bold text-primary">{fmtCurrency(totalAmount)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => navigate('/warehouse/receipts')}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSaveDraft}
                            isLoading={isLoading}
                            disabled={isLoading}
                            leftIcon={<span className="material-symbols-outlined text-[18px]">save</span>}
                        >
                            Lưu nháp
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Create Supplier Modal */}
            <SupplierFormModal
                isOpen={isSupplierModalOpen}
                onClose={() => setIsSupplierModalOpen(false)}
                supplier={null}
                onSuccess={(newSupplier) => setSupplierId(newSupplier.id)}
            />

            {/* Quick Create Product Modal */}
            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={null}
                categories={categories}
                onSuccess={handleProductCreated}
            />
        </div>
    );
}
