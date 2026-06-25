import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCustomerForm: {
    fullName: string;
    phone: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    groupId: number;
  };
  setNewCustomerForm: React.Dispatch<React.SetStateAction<{
    fullName: string;
    phone: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    groupId: number;
  }>>;
  groups: any[];
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCustomerForm,
  setNewCustomerForm,
  groups,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={onSubmit}
        className="bg-surface-container-lowest border border-outline/10 rounded-2xl w-full max-w-[450px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-md border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Thêm khách hàng mới</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-md space-y-md">
          <Input
            id="modal-fullName"
            label="Họ tên khách hàng"
            required
            value={newCustomerForm.fullName}
            onChange={(e) => setNewCustomerForm(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Ví dụ: Nguyễn Thị Hương"
          />

          <Input
            id="modal-phone"
            label="Số điện thoại"
            required
            pattern="[0-9]{10,11}"
            value={newCustomerForm.phone}
            onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Ví dụ: 0987654321"
          />

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Giới tính</label>
            <div className="flex gap-md mt-1">
              {[
                { label: 'Nam', value: 'MALE' },
                { label: 'Nữ', value: 'FEMALE' },
                { label: 'Khác', value: 'OTHER' }
              ].map((g) => (
                <label key={g.value} className="flex items-center gap-xs cursor-pointer text-sm text-on-surface">
                  <input
                    type="radio"
                    name="modal-gender"
                    checked={newCustomerForm.gender === g.value}
                    onChange={() => setNewCustomerForm(prev => ({ ...prev, gender: g.value as any }))}
                    className="form-radio text-primary"
                  />
                  <span>{g.label}</span>
                </label>
              ))}
            </div>
          </div>

          {groups.length > 1 && (
            <Select
              id="modal-groupId"
              label="Nhóm khách hàng"
              value={newCustomerForm.groupId.toString()}
              onChange={(val) => setNewCustomerForm(prev => ({ ...prev, groupId: Number(val) }))}
              options={groups.map((group) => ({ label: group.name, value: group.id.toString() }))}
            />
          )}
        </div>

        <div className="p-md border-t border-outline/10 bg-surface-container-low flex justify-end gap-sm">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Đăng ký & Chọn
          </Button>
        </div>
      </form>
    </div>
  );
};
