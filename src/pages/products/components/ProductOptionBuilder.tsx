import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ProductOption, ProductOptionValue } from '@/types/product.types';

interface ProductOptionBuilderProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
}

export function ProductOptionBuilder({ options, onChange }: ProductOptionBuilderProps) {
  const [newName, setNewName] = useState('');
  const [newValues, setNewValues] = useState('');

  const addOption = () => {
    const trimmedName = newName.trim();
    const values = newValues.split(',').map(v => v.trim()).filter(Boolean);

    if (!trimmedName || values.length === 0) return;
    if (options.length >= 3) return;

    // Kiểm tra trùng tên
    if (options.some(o => o.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error(`Option "${trimmedName}" đã tồn tại`);
      return;
    }

    const newOption: ProductOption = {
      name: trimmedName,
      position: options.length + 1,
      values: values.map(v => ({ value: v })),
    };

    onChange([...options, newOption]);
    setNewName('');
    setNewValues('');
  };

  const removeOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index)
      .map((opt, i) => ({ ...opt, position: i + 1 }));
    onChange(updated);
  };

  const updateOptionName = (index: number, name: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], name };
    onChange(updated);
  };

  const updateOptionValues = (index: number, rawValues: string) => {
    const values: ProductOptionValue[] = rawValues
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => ({ value: v }));

    const updated = [...options];
    updated[index] = { ...updated[index], values };
    onChange(updated);
  };

  const removeValue = (optionIndex: number, valueIndex: number) => {
    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      values: updated[optionIndex].values.filter((_, i) => i !== valueIndex),
    };
    onChange(updated);
  };

  return (
    <div className="bg-surface-container rounded-lg p-4 border border-outline/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-title-sm text-title-sm text-on-surface">
          <span className="material-symbols-outlined text-base align-middle mr-1">tune</span>
          Thuộc tính ({options.length}/3)
        </h3>
        {options.length < 3 && (
          <span className="text-xs text-on-surface-variant/60">
            Còn thêm được {3 - options.length} thuộc tính
          </span>
        )}
      </div>

      {/* Form thêm option mới */}
      {options.length < 3 && (
        <div className="flex gap-3 mb-4 items-end">
          <div className="w-1/3">
            <Input
              id="new-option-name"
              label="Tên thuộc tính"
              placeholder="VD: Màu sắc"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              id="new-option-values"
              label="Giá trị (phân cách bằng dấu phẩy)"
              placeholder="VD: Đỏ, Xanh, Vàng"
              value={newValues}
              onChange={(e) => setNewValues(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOption()}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={addOption}
            leftIcon={<span className="material-symbols-outlined text-sm">add</span>}
          >
            Thêm
          </Button>
        </div>
      )}

      {/* Danh sách options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className="bg-surface-container-lowest rounded-lg p-3 border border-outline/15 transition-all hover:border-outline/30"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant/50 uppercase tracking-wider">
                    Option {index + 1}
                  </span>
                  <Input
                    id={`option-name-${index}`}
                    value={option.name}
                    onChange={(e) => updateOptionName(index, e.target.value)}
                    placeholder="Tên thuộc tính"
                    className="text-sm font-medium"
                  />
                </div>
                <Input
                  id={`option-values-${index}`}
                  value={option.values.map(v => v.value).join(', ')}
                  onChange={(e) => updateOptionValues(index, e.target.value)}
                  placeholder="Giá trị (cách nhau bởi dấu phẩy)"
                  className="text-sm"
                  helperText="Nhấn phẩy để tách giá trị"
                />
                {/* Value chips */}
                <div className="flex flex-wrap gap-1.5">
                  {option.values.map((val, vi) => (
                    <span
                      key={vi}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium group"
                    >
                      {val.value}
                      <button
                        type="button"
                        onClick={() => removeValue(index, vi)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-primary/60 hover:text-error"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-all"
                title="Xóa thuộc tính"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {options.length === 0 && (
        <div className="text-center py-8 text-on-surface-variant/50">
          <span className="material-symbols-outlined text-3xl block mb-2">category</span>
          <p className="text-sm font-medium">Chưa có thuộc tính nào</p>
          <p className="text-xs mt-1">
            Thêm thuộc tính (VD: Màu sắc, Kích cỡ) để tạo biến thể tự động
          </p>
        </div>
      )}
    </div>
  );
}