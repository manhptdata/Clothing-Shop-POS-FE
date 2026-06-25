import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ProductOptionBuilder } from './ProductOptionBuilder';
import { VariantMatrix, VariantFormData } from './VariantMatrix';
import { ImageUploader } from './ImageUploader';
import { useCreateProductMutation, useUpdateProductMutation } from '@/redux/api/productApi';
import type {
    Product,
    ProductOption,
    ProductVariant,
    ProductRequest,
    Category,
    ProductAttribute
} from '@/types/product.types';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
    categories: Category[];
}

interface FormData {
    name: string;
    description: string;
    categoryId: string;
    imageUrls: string[];
    options: ProductOption[];
    variants: VariantFormData[];
    attributes: ProductAttribute[];
}

const INITIAL_FORM: FormData = {
    name: '',
    description: '',
    categoryId: '',
    imageUrls: [],
    options: [],
    variants: [],
    attributes: [],
};

export default function ProductFormModal({
    isOpen,
    onClose,
    product,
    categories,
}: ProductFormModalProps) {
    const [formData, setFormData] = useState<FormData>(() => {
        if (product) {
            return {
                name: product.name,
                description: product.description || '',
                categoryId: product.category?.id?.toString() || '',
                imageUrls: product.imageUrls || [],
                options: [...(product.options || [])]
                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                    .map(o => ({
                        ...o,
                        values: (o.values as unknown as string[]).map(v => typeof v === 'string' ? { value: v } : v)
                    })),
                variants: (product.variants || []).map(v => ({
                    ...v,
                    option1Value: typeof v.option1Value === 'string' ? { value: v.option1Value } : v.option1Value,
                    option2Value: typeof v.option2Value === 'string' ? { value: v.option2Value } : v.option2Value,
                    option3Value: typeof v.option3Value === 'string' ? { value: v.option3Value } : v.option3Value,
                    _selected: true
                })),
                attributes: product.attributes || [],
            };
        }
        return INITIAL_FORM;
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    const isEditing = !!product;
    const isSaving = isCreating || isUpdating;

    // Reset/populate form khi modal mở
    useEffect(() => {
        if (isOpen && product) {
            // Sync in case product changes while open
            setFormData({
                name: product.name,
                description: product.description || '',
                categoryId: product.category?.id?.toString() || '',
                imageUrls: product.imageUrls || [],
                options: [...(product.options || [])]
                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                    .map(o => ({
                        ...o,
                        values: (o.values as unknown as string[]).map(v => typeof v === 'string' ? { value: v } : v)
                    })),
                variants: (product.variants || []).map(v => ({
                    ...v,
                    option1Value: typeof v.option1Value === 'string' ? { value: v.option1Value } : v.option1Value,
                    option2Value: typeof v.option2Value === 'string' ? { value: v.option2Value } : v.option2Value,
                    option3Value: typeof v.option3Value === 'string' ? { value: v.option3Value } : v.option3Value,
                    _selected: true
                })),
                attributes: product.attributes || [],
            });
        } else if (isOpen && !product) {
            setFormData(INITIAL_FORM);
        }
        setErrors({});
    }, [isOpen, product]);

    // Handlers
    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error khi user sửa
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleOptionsChange = (options: ProductOption[]) => {
        updateField('options', options);
    };

    const handleVariantsChange = (variants: VariantFormData[]) => {
        updateField('variants', variants);
    };

    // Thuộc tính chung (Attributes)
    const handleAddAttribute = () => {
        updateField('attributes', [...formData.attributes, { attrKey: '', attrValue: '' }]);
    };

    const handleUpdateAttribute = (index: number, field: keyof ProductAttribute, value: string) => {
        const newAttrs = [...formData.attributes];
        newAttrs[index] = { ...newAttrs[index], [field]: value };
        updateField('attributes', newAttrs);
    };

    const handleRemoveAttribute = (index: number) => {
        updateField('attributes', formData.attributes.filter((_, i) => i !== index));
    };

    // Validation
    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (!formData.name.trim()) errs.name = 'Tên sản phẩm là bắt buộc';
        if (!formData.categoryId) errs.categoryId = 'Vui lòng chọn danh mục';
        if (formData.options.length === 0) errs.options = 'Cần ít nhất 1 thuộc tính';

        const selectedVariants = formData.variants.filter(v => v._selected !== false);
        if (selectedVariants.length === 0) errs.variants = 'Cần chọn ít nhất 1 biến thể để tạo';

        // Check SKU trống
        // const emptySku = selectedVariants.some(v => !v.sku?.trim());
        // if (emptySku) errs.variants = 'Mã SKU không được để trống cho các biến thể đã chọn';

        // Check giá bán
        const zeroPrice = selectedVariants.some(v => !v.salePrice || v.salePrice <= 0);
        if (zeroPrice && !errs.variants) errs.variants = 'Giá bán phải lớn hơn 0 cho các biến thể đã chọn';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Submit
    const handleSubmit = async () => {
        if (!validate()) return;

        const actionText = isEditing ? 'lưu các thay đổi của sản phẩm này' : 'tạo sản phẩm mới này';
        const isConfirmed = window.confirm(`Bạn có chắc chắn muốn ${actionText}?`);
        if (!isConfirmed) return;

        const selectedVariants = formData.variants.filter(v => v._selected !== false);
        const validAttributes = formData.attributes.filter(a => a.attrKey.trim() && a.attrValue.trim());

        const requestData: ProductRequest = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            categoryId: Number(formData.categoryId),
            imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
            options: formData.options.map(o => ({
                name: o.name,
                position: o.position,
                values: o.values.map(val => val.value)
            })),
            variants: selectedVariants.map(v => ({
                sku: v.sku || '',
                salePrice: v.salePrice || 0,
                importPrice: v.importPrice || 0,
                lowStockThreshold: v.lowStockThreshold || 5,
                option1Value: v.option1Value?.value,
                option2Value: v.option2Value?.value,
                option3Value: v.option3Value?.value,
                imageUrl: v.imageUrl,
            })),
            attributes: validAttributes.map(a => ({
                attrKey: a.attrKey,
                attrValue: a.attrValue,
            })),
        };

        try {
            if (isEditing && product) {
                await updateProduct({ id: product.id, data: requestData }).unwrap();
            } else {
                await createProduct(requestData).unwrap();
            }
            onClose();
        } catch (err: any) {
            console.error('Lỗi lưu sản phẩm:', err);
            const errorMsg = err?.data?.message || err?.message || 'Đã xảy ra lỗi không xác định';
            alert(`Lỗi lưu sản phẩm: ${errorMsg}`);
        }
    };

    // Category options cho Select
    const categoryOptions = [
        { value: '', label: '— Chọn danh mục —' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name })),
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            size="2xl"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSaving}
                        leftIcon={
                            <span className="material-symbols-outlined text-sm">
                                {isEditing ? 'save' : 'add_circle'}
                            </span>
                        }
                    >
                        {isEditing ? 'Cập nhật' : 'Tạo sản phẩm'}
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                {/* ===== LAYOUT 2 CỘT ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* === CỘT TRÁI: Thông tin + Options + Attributes === */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Thông tin cơ bản */}
                        <div className="bg-surface-container rounded-lg p-4 border border-outline/10">
                            <h3 className="font-title-sm text-title-sm text-on-surface mb-4 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">info</span>
                                Thông tin cơ bản
                            </h3>
                            <div className="space-y-3">
                                <Input
                                    id="product-name"
                                    label="Tên sản phẩm *"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="VD: Áo khoác Trench len"
                                    error={errors.name}
                                />

                                <div className="flex flex-col gap-1">
                                    <label className="font-label-caps text-label-caps text-on-surface">
                                        Mô tả
                                    </label>
                                    <textarea
                                        className="w-full bg-transparent border border-outline/20 font-body-md text-body-md text-on-surface placeholder:text-outline-variant p-2 rounded transition-colors focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary resize-none"
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        placeholder="Mô tả chi tiết sản phẩm..."
                                        rows={3}
                                    />
                                </div>

                                <Select
                                    id="product-category"
                                    label="Danh mục *"
                                    value={formData.categoryId}
                                    onChange={(value) => updateField('categoryId', value)}
                                    options={categoryOptions}
                                    error={errors.categoryId}
                                />
                            </div>
                        </div>

                        {/* Thuộc tính chung (Attributes) */}
                        <div className="bg-surface-container rounded-lg p-4 border border-outline/10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">label</span>
                                    Đặc điểm chung
                                </h3>
                                <Button variant="ghost" size="sm" onClick={handleAddAttribute} leftIcon={<span className="material-symbols-outlined text-sm">add</span>}>
                                    Thêm
                                </Button>
                            </div>

                            {formData.attributes.length === 0 ? (
                                <p className="text-sm text-on-surface-variant/60 italic text-center py-2">
                                    Chưa có đặc điểm chung nào (vd: Thương hiệu, Chất liệu, ...)
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {formData.attributes.map((attr, idx) => (
                                        <div key={idx} className="flex gap-2 items-start">
                                            <div className="flex-1">
                                                <Input
                                                    id={`attr-key-${idx}`}
                                                    placeholder="Tên (VD: Thương hiệu)"
                                                    value={attr.attrKey}
                                                    onChange={(e) => handleUpdateAttribute(idx, 'attrKey', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Input
                                                    id={`attr-val-${idx}`}
                                                    placeholder="Giá trị (VD: Zara)"
                                                    value={attr.attrValue}
                                                    onChange={(e) => handleUpdateAttribute(idx, 'attrValue', e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="text-error mt-0.5"
                                                onClick={() => handleRemoveAttribute(idx)}
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Option Builder */}
                        <div>
                            <ProductOptionBuilder
                                options={formData.options}
                                onChange={handleOptionsChange}
                            />
                            {errors.options && (
                                <p className="text-error text-xs mt-1">{errors.options}</p>
                            )}
                        </div>
                    </div>

                    {/* === CỘT PHẢI: Ảnh === */}
                    <div>
                        <ImageUploader
                            images={formData.imageUrls}
                            onChange={(urls) => updateField('imageUrls', urls)}
                        />
                    </div>
                </div>

                {/* ===== VARIANT MATRIX (full width) ===== */}
                <div>
                    <VariantMatrix
                        productName={formData.name}
                        options={formData.options}
                        variants={formData.variants}
                        onChange={handleVariantsChange}
                    />
                    {errors.variants && (
                        <p className="text-error text-xs mt-1">{errors.variants}</p>
                    )}
                </div>
            </div>
        </Modal>
    );
}