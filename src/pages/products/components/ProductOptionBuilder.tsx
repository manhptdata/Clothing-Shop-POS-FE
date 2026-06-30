import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { ProductOption, ProductOptionValue } from '@/types/product.types';

interface ProductOptionBuilderProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
}

export function ProductOptionBuilder({ options, onChange }: ProductOptionBuilderProps) {
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  
  // Reorder Modal State
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderOptions, setReorderOptions] = useState<ProductOption[]>([]);
  const [draggingRowIndex, setDraggingRowIndex] = useState<number | null>(null);
  const [draggingChip, setDraggingChip] = useState<{row: number, chip: number} | null>(null);

  const openReorderModal = () => {
    setReorderOptions(JSON.parse(JSON.stringify(options)));
    setIsReorderModalOpen(true);
  };

  const handleConfirmReorder = () => {
    // Update positions
    const finalized = reorderOptions.map((opt, i) => ({ ...opt, position: i + 1 }));
    onChange(finalized);
    setIsReorderModalOpen(false);
  };

  const handleDragOverRow = (e: React.DragEvent, hoverIndex: number) => {
    e.preventDefault();
    if (draggingRowIndex === null || draggingRowIndex === hoverIndex) return;

    const updated = [...reorderOptions];
    const [moved] = updated.splice(draggingRowIndex, 1);
    updated.splice(hoverIndex, 0, moved);
    setReorderOptions(updated);
    setDraggingRowIndex(hoverIndex);
  };

  const handleDragOverChip = (e: React.DragEvent, rowIdx: number, hoverChipIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingChip || draggingChip.row !== rowIdx || draggingChip.chip === hoverChipIdx) return;

    const updated = [...reorderOptions];
    const rowValues = [...updated[rowIdx].values];
    const [moved] = rowValues.splice(draggingChip.chip, 1);
    rowValues.splice(hoverChipIdx, 0, moved);
    updated[rowIdx].values = rowValues;
    
    setReorderOptions(updated);
    setDraggingChip({ row: rowIdx, chip: hoverChipIdx });
  };

  const handleDragEnd = () => {
    setDraggingRowIndex(null);
    setDraggingChip(null);
  };

  const addOptionRow = () => {
    if (options.length >= 3) return;
    const newOption: ProductOption = {
      name: '',
      position: options.length + 1,
      values: [],
    };
    onChange([...options, newOption]);
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

  const handleInputChange = (index: number, value: string) => {
    setInputValues(prev => ({ ...prev, [index]: value }));
  };

  const commitTag = (index: number) => {
    const val = (inputValues[index] || '').trim();
    if (val) {
      const option = options[index];
      const exists = option.values.some(v => v.value.toLowerCase() === val.toLowerCase());
      if (!exists) {
        const newValues = [...option.values, { value: val }];
        const updated = [...options];
        updated[index] = { ...updated[index], values: newValues };
        onChange(updated);
      }
      setInputValues(prev => ({ ...prev, [index]: '' }));
    }
  };

  const handleInputKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTag(index);
    }
  };

  const handleInputBlur = (index: number) => {
    commitTag(index);
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
          Thuộc tính
        </h3>
        <button 
          onClick={openReorderModal}
          className="text-primary text-sm flex items-center hover:underline"
        >
          <span className="material-symbols-outlined text-sm mr-1">drag_indicator</span>
          Sắp xếp thuộc tính
        </button>
      </div>

      {options.length > 0 && (
        <>
          <div className="grid grid-cols-[1fr_2fr_auto] gap-4 mb-2">
            <div className="font-semibold text-sm text-on-surface">Tên thuộc tính</div>
            <div className="font-semibold text-sm text-on-surface">Giá trị</div>
            <div className="w-8"></div>
          </div>
          <div className="border-t border-outline/10 mb-4"></div>
        </>
      )}

      <div className="space-y-3 mb-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-1/3">
              <Input
                id={`option-name-${index}`}
                value={option.name}
                onChange={(e) => updateOptionName(index, e.target.value)}
                placeholder="VD: Kích thước, Màu sắc"
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <div 
                className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded border border-outline-variant bg-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all cursor-text"
                onClick={() => document.getElementById(`option-values-${index}`)?.focus()}
              >
                {option.values.map((val, vi) => (
                  <span
                    key={vi}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#E8F0FE] text-[#1967D2] rounded-full text-xs font-medium"
                  >
                    {val.value}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(index, vi);
                      }}
                      className="text-[#1967D2]/70 hover:text-[#1967D2] flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
                <input
                  id={`option-values-${index}`}
                  value={inputValues[index] || ''}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleInputKeyDown(index, e)}
                  onBlur={() => handleInputBlur(index)}
                  placeholder={option.values.length === 0 ? "Nhập ký tự và ấn enter" : ""}
                  className="flex-1 min-w-[50px] max-w-full bg-transparent border-none outline-none text-sm p-0 m-0 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="mt-1 p-1.5 rounded-lg text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-all flex-shrink-0"
              title="Xóa thuộc tính"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        ))}
      </div>

      {options.length < 3 && (
        <button
          onClick={addOptionRow}
          className="text-primary text-sm font-medium flex items-center hover:underline"
        >
          <span className="material-symbols-outlined text-sm mr-1">add_circle</span>
          Thêm thuộc tính khác
        </button>
      )}

      {/* Reorder Modal */}
      <Modal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        title="Sắp xếp thuộc tính"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReorderModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmReorder}>
              Xác nhận
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {reorderOptions.map((row, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => {
                if ((e.target as HTMLElement).closest('.chip-draggable')) {
                  e.preventDefault();
                  return;
                }
                setDraggingRowIndex(index);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnter={(e) => handleDragOverRow(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragEnd}
              onDragEnd={handleDragEnd}
              className={`flex items-start gap-4 p-3 rounded-lg border border-transparent hover:bg-surface-container-low transition-colors ${draggingRowIndex === index ? 'opacity-30 border-dashed border-primary bg-primary/5' : ''}`}
            >
              <div className="flex items-center gap-2 mt-1 w-1/3">
                <span className="material-symbols-outlined text-on-surface-variant/50 cursor-grab">drag_indicator</span>
                <span className="font-medium text-sm text-on-surface truncate">
                  {row.name || '(Chưa có tên)'}
                </span>
              </div>
              
              <div className="flex-1 flex flex-wrap gap-2">
                {row.values.map((val, vi) => (
                  <div
                    key={vi}
                    draggable
                    className={`chip-draggable flex items-center gap-1.5 px-3 py-1 bg-[#E8F0FE] text-[#1967D2] rounded-full text-sm cursor-grab transition-all ${draggingChip?.row === index && draggingChip?.chip === vi ? 'opacity-30 scale-95 ring-2 ring-primary' : ''}`}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDraggingChip({ row: index, chip: vi });
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnter={(e) => handleDragOverChip(e, index, vi)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleDragEnd();
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      handleDragEnd();
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px] opacity-50">drag_indicator</span>
                    {val.value}
                  </div>
                ))}
                {row.values.length === 0 && (
                  <span className="text-sm text-on-surface-variant/50 italic mt-1">Chưa có giá trị</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}