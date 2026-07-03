import { useEffect, useMemo, useState, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { uploadMultipleImagesToCloudinary } from '@/utils/cloudinary';
import type { ProductOption, ProductOptionValue, ProductVariant } from '@/types/product.types';

export type VariantFormData = Partial<ProductVariant> & { _selected?: boolean };

interface VariantMatrixProps {
  productName: string;
  options: ProductOption[];
  variants: VariantFormData[];
  onChange: (variants: VariantFormData[]) => void;
  isEditing?: boolean;
  productImages?: string[];
  onProductImagesChange?: (images: string[]) => void;
}

/**
 * Tích Descartes: nhân các option values với nhau
 */
function cartesian(arrays: ProductOptionValue[][]): ProductOptionValue[][] {
  if (arrays.length === 0) return [[]];

  return arrays.reduce<ProductOptionValue[][]>(
    (acc, curr) => acc.flatMap(combo => curr.map(val => [...combo, val])),
    [[]]
  );
}

/**
 * Tạo key duy nhất cho mỗi combo option values để match với variant đã nhập
 */
function comboKey(combo: ProductOptionValue[]): string {
  return combo.map(v => v.value).join('|||');
}

function generateProductInitials(name: string): string {
  if (!name) return '';
  const noTone = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

  return noTone
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .join('');
}

function generateOptionValueCode(val: string): string {
  if (!val) return '';
  const noTone = val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
  return noTone.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function VariantMatrix({ productName, options, variants, onChange, isEditing, productImages, onProductImagesChange }: VariantMatrixProps) {
  const [selectingImageIndex, setSelectingImageIndex] = useState<number | null>(null);
  const [tempSelectedImageUrl, setTempSelectedImageUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // useRef để luôn giữ giá trị variants mới nhất, tránh stale closure trong useEffect
  const variantsRef = useRef<VariantFormData[]>(variants);
  useEffect(() => {
    variantsRef.current = variants;
  }); // Không deps → chạy mỗi render, luôn sync với prop mới nhất

  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      try {
          setIsUploadingImage(true);
          const uploadedUrls = await uploadMultipleImagesToCloudinary(files);
          
          if (onProductImagesChange && productImages) {
              onProductImagesChange([...productImages, ...uploadedUrls]);
          } else if (onProductImagesChange) {
              onProductImagesChange([...uploadedUrls]);
          }

          if (uploadedUrls.length > 0) {
              setTempSelectedImageUrl(uploadedUrls[0]);
          }
      } catch (error) {
          console.error('Lỗi khi tải ảnh lên:', error);
          alert('Có lỗi xảy ra khi tải ảnh lên.');
      } finally {
          setIsUploadingImage(false);
          if (fileInputRef.current) {
              fileInputRef.current.value = '';
          }
      }
  };
  // Lọc options hợp lệ (có name + ít nhất 1 value)
  const activeOptions = useMemo(
    () => options.filter(o => o.name.trim() && o.values.length > 0),
    [options]
  );

  // Sinh tất cả combo từ cartesian product
  const combinations = useMemo(
    () => cartesian(activeOptions.map(o => o.values)),
    [activeOptions]
  );

  // Khi options thay đổi → sinh lại variants, giữ data đã nhập
  useEffect(() => {
    if (activeOptions.length === 0) {
      onChange([]);
      return;
    }

    const prodInitials = generateProductInitials(productName);

    const newVariants: VariantFormData[] = combinations.map(combo => {
      const variant: VariantFormData = {
        option1Value: combo[0] || undefined,
        option2Value: combo[1] || undefined,
        option3Value: combo[2] || undefined,
      };

      // Tìm variant đã tồn tại để giữ lại data đã nhập
      // Dùng variantsRef.current thay vì variants để tránh stale closure
      const existingKey = comboKey(combo);
      const existing = variantsRef.current.find(v => {
        const vCombo = [v.option1Value, v.option2Value, v.option3Value]
          .filter((x): x is ProductOptionValue => !!x);
        return comboKey(vCombo) === existingKey;
      });

      // Tạo gợi ý SKU
      const optionCodes = combo.map(v => generateOptionValueCode(v.value));
      const suggestedSku = [prodInitials, ...optionCodes].filter(Boolean).join('-');

      if (existing) {
        return {
          ...variant,
          id: existing.id,
          sku: existing.sku || suggestedSku,
          salePrice: existing.salePrice,
          importPrice: existing.importPrice,
          quantity: existing.quantity,
          lowStockThreshold: existing.lowStockThreshold,
          imageUrl: existing.imageUrl,
          _selected: existing._selected !== undefined ? existing._selected : (existing.id !== undefined ? true : false),
        };
      }

      // Defaults cho variant mới
      return {
        ...variant,
        sku: suggestedSku,
        salePrice: 0,
        importPrice: 0,
        quantity: 0,
        lowStockThreshold: 5,
        _selected: isEditing ? false : true,
      };
    });

    // Chỉ trigger onChange nếu có sự thay đổi thực sự về số lượng hoặc cấu trúc
    onChange(newVariants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOptions, combinations, productName]);

  const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const toggleAll = () => {
    const allSelected = variants.every(v => v._selected !== false);
    const updated = variants.map(v => ({ ...v, _selected: !allSelected }));
    onChange(updated);
  };

  const handleOpenImageSelector = (index: number) => {
    if (variants[index]._selected === false) return;
    if (!productImages || productImages.length === 0) {
      alert("Vui lòng tải ảnh sản phẩm lên trước ở phần Thư viện Ảnh bên cạnh.");
      return;
    }
    setSelectingImageIndex(index);
    setTempSelectedImageUrl(variants[index].imageUrl);
  };

  const handleApplyImage = () => {
    if (selectingImageIndex !== null) {
      updateVariant(selectingImageIndex, 'imageUrl', tempSelectedImageUrl);
    }
    setSelectingImageIndex(null);
  };

  if (activeOptions.length === 0 || combinations.length === 0) {
    return null;
  }

  const allSelected = variants.length > 0 && variants.every(v => v._selected !== false);
  const someSelected = variants.some(v => v._selected !== false);

  return (
    <div className="bg-surface-container rounded-lg p-4 border border-outline/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-title-sm text-title-sm text-on-surface">
          <span className="material-symbols-outlined text-base align-middle mr-1">grid_view</span>
          Biến thể ({variants.filter(v => v._selected !== false).length}/{variants.length})
        </h3>
        <span className="text-xs text-on-surface-variant/60">
          Chọn các biến thể bạn muốn tạo
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-outline/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="text-center px-3 py-2.5 text-xs font-semibold w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={toggleAll}
                  className="rounded border-outline/20 text-primary focus:ring-primary"
                />
              </th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider whitespace-nowrap w-12">
                Ảnh
              </th>
              {activeOptions.map((opt, i) => (
                <th
                  key={i}
                  className="text-left px-3 py-2.5 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider whitespace-nowrap"
                >
                  {opt.name}
                </th>
              ))}
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider whitespace-nowrap">
                Mã SKU
              </th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider whitespace-nowrap">
                Giá bán (₫) *
              </th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider whitespace-nowrap">
                Giá nhập (₫)
              </th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider whitespace-nowrap">
                Tồn kho
              </th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider whitespace-nowrap">
                Tồn kho thấp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/10">
            {variants.map((variant, index) => {
              const optionValues = [variant.option1Value, variant.option2Value, variant.option3Value]
                .filter((x): x is ProductOptionValue => !!x);

              const isSelected = variant._selected !== false;

              return (
                <tr
                  key={index}
                  className={`transition-colors ${isSelected ? 'hover:bg-surface-container-low/50' : 'bg-surface-container-low/30 opacity-60'}`}
                >
                  <td className="px-3 py-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => updateVariant(index, '_selected', e.target.checked)}
                        className="rounded border-outline/20 text-primary focus:ring-primary"
                      />
                      {isEditing && !isSelected && variant.id && (
                        <span className="text-[10px] text-error font-medium px-1.5 py-0.5 bg-error/10 rounded whitespace-nowrap" title={variant.isActive === false ? "Biến thể này đã bị vô hiệu hóa. Tick để kích hoạt lại." : "Biến thể này đã tồn tại, nếu bỏ chọn sẽ bị vô hiệu hóa"}>
                          {variant.isActive === false ? 'Đã vô hiệu hóa' : 'Sẽ bị vô hiệu hóa'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Ảnh */}
                  <td className="px-3 py-2 text-center">
                    <div 
                      className={`w-8 h-8 rounded border flex items-center justify-center overflow-hidden cursor-pointer ${isSelected ? 'border-outline/30 hover:border-primary bg-surface-container-lowest' : 'border-outline/10 opacity-50 bg-surface-container'}`}
                      onClick={() => handleOpenImageSelector(index)}
                      title={(!productImages || productImages.length === 0) ? "Vui lòng thêm ảnh ở Thư viện ảnh trước" : "Nhấn để chọn ảnh"}
                    >
                      {variant.imageUrl ? (
                        <img src={variant.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-sm text-on-surface-variant/50">image</span>
                      )}
                    </div>
                  </td>

                  {/* Option value chips */}
                  {activeOptions.map((opt, oi) => (
                    <td key={oi} className="px-3 py-2">
                      {optionValues[oi] && (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isSelected ? 'bg-primary/10 text-primary' : 'bg-outline/10 text-on-surface-variant'}`}>
                          {optionValues[oi].value}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* SKU */}
                  <td className="px-2 py-1.5">
                    <Input
                      id={`sku-${index}`}
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder="SKU"
                      disabled={!isSelected}
                      className="py-1 text-xs w-28 placeholder:text-[10px]"
                    />
                  </td>

                  {/* Giá bán */}
                  <td className="px-2 py-1.5">
                    <Input
                      id={`sale-${index}`}
                      type="number"
                      value={variant.salePrice || ''}
                      onChange={(e) => updateVariant(index, 'salePrice', e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="0"
                      disabled={!isSelected}
                      className="py-1 text-xs w-24 text-right"
                    />
                  </td>

                  {/* Giá nhập */}
                  <td className="px-2 py-1.5">
                    <Input
                      id={`import-${index}`}
                      type="number"
                      value={variant.importPrice || ''}
                      onChange={(e) => updateVariant(index, 'importPrice', e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="0"
                      disabled={true}
                      title="Hãy điều chỉnh giá nhập thông qua phiếu nhập kho."
                      className="py-1 text-xs w-24 text-right"
                    />
                  </td>

                  {/* Tồn kho */}
                  <td className="px-2 py-1.5">
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      value={variant.quantity ?? 0}
                      onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      disabled={true}
                      title="Hãy điều chỉnh tồn kho thông qua phiếu nhập kho."
                      className="py-1 text-xs w-20 text-right"
                    />
                  </td>

                  {/* Ngưỡng */}
                  <td className="px-2 py-1.5">
                    <Input
                      id={`threshold-${index}`}
                      type="number"
                      value={variant.lowStockThreshold ?? 5}
                      onChange={(e) => updateVariant(index, 'lowStockThreshold', parseInt(e.target.value) || 5)}
                      placeholder="5"
                      disabled={!isSelected}
                      className="py-1 text-xs w-16 text-right"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Chọn Ảnh */}
      <Modal
        isOpen={selectingImageIndex !== null}
        onClose={() => setSelectingImageIndex(null)}
        title="Chọn ảnh cho phiên bản"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectingImageIndex(null)}>
              Thoát
            </Button>
            <Button variant="primary" onClick={handleApplyImage}>
              Áp dụng
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-4 py-2">
          {/* Nút thêm ảnh (+) */}
          <div
            className={`w-24 h-24 rounded-lg border-2 border-dashed border-outline/30 flex items-center justify-center transition-colors ${isUploadingImage ? 'opacity-50 cursor-not-allowed bg-surface-container-high' : 'cursor-pointer hover:border-primary/50 hover:bg-surface-container'}`}
            onClick={() => !isUploadingImage && fileInputRef.current?.click()}
            title="Thêm ảnh mới"
          >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleVariantImageUpload}
                disabled={isUploadingImage}
            />
            {isUploadingImage ? (
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <span className="material-symbols-outlined text-4xl text-outline-variant">add</span>
            )}
          </div>

          {/* Danh sách ảnh */}
          {productImages?.map((url, i) => {
            const isSelected = tempSelectedImageUrl === url;
            return (
              <div
                key={i}
                className={`relative w-24 h-24 rounded-lg border-2 cursor-pointer overflow-hidden transition-all bg-surface-container-lowest ${
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-outline/50 shadow-sm'
                }`}
                onClick={() => setTempSelectedImageUrl(isSelected ? undefined : url)}
              >
                <img src={url} alt={`Lựa chọn ${i}`} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute top-1 left-1 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}