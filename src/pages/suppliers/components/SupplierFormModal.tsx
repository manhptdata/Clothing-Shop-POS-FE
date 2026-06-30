import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useCreateSupplierMutation, useUpdateSupplierMutation } from '@/redux/api/supplierApi';
import type { Supplier, SupplierRequest } from '@/types/supplier.types';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null; // Nếu có => Mode Sửa, null => Mode Thêm
  onSuccess?: (supplier: Supplier) => void;
}

export default function SupplierFormModal({ isOpen, onClose, supplier, onSuccess }: SupplierFormModalProps) {
  const isEditMode = !!supplier;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierRequest>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      note: '',
    },
  });

  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        reset({
          name: supplier.name,
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          note: supplier.note || '',
        });
      } else {
        reset({
          name: '',
          phone: '',
          email: '',
          address: '',
          note: '',
        });
      }
    }
  }, [isOpen, supplier, reset]);

  const onSubmit = async (data: SupplierRequest) => {
    try {
      if (isEditMode && supplier) {
        const res = await updateSupplier({ id: supplier.id, data }).unwrap();
        alert('Cập nhật nhà cung cấp thành công!');
        onSuccess?.(res);
      } else {
        const res = await createSupplier(data).unwrap();
        alert('Thêm nhà cung cấp thành công!');
        onSuccess?.(res);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to save supplier:', err);
      alert(err?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu nhà cung cấp');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-outline/10">
          <h3 className="font-display-sm text-display-sm text-on-surface">
            {isEditMode ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp'}
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-variant/50"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="p-6">
          <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Tên NCC */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Tên nhà cung cấp <span className="text-error">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Tên nhà cung cấp không được để trống' })}
                placeholder="Nhập tên nhà cung cấp..."
                className={`w-full px-4 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.name 
                    ? 'border-error focus:border-error focus:ring-error/20' 
                    : 'border-outline/20 focus:border-primary focus:ring-primary/20'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Số điện thoại */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Số điện thoại <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  {...register('phone', { required: 'Số điện thoại không được để trống' })}
                  placeholder="Nhập số điện thoại..."
                  className={`w-full px-4 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.phone 
                      ? 'border-error focus:border-error focus:ring-error/20' 
                      : 'border-outline/20 focus:border-primary focus:ring-primary/20'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-error">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email không được để trống',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: 'Email không đúng định dạng',
                    },
                  })}
                  placeholder="Nhập email..."
                  className={`w-full px-4 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.email 
                      ? 'border-error focus:border-error focus:ring-error/20' 
                      : 'border-outline/20 focus:border-primary focus:ring-primary/20'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder="Nhập địa chỉ..."
                className="w-full px-4 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Ghi chú
              </label>
              <textarea
                {...register('note')}
                placeholder="Nhập ghi chú (nếu có)..."
                rows={3}
                className="w-full px-4 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

          </form>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-outline/10 bg-surface-container-lowest">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="supplier-form"
            disabled={isSubmitting}
            leftIcon={isSubmitting ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : undefined}
          >
            {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </div>
      </div>
    </div>
  );
}
