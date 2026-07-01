import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUpdateCustomerGroupMutation, useGetVoucherOptionsQuery } from "@/redux/api/customerApi";
import type { CustomerGroups } from "@/types/customer.types";

interface CustomerGroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: CustomerGroups | null;
}

export default function CustomerGroupEditModal({
  isOpen,
  onClose,
  group,
}: CustomerGroupEditModalProps) {
  const [updateCustomerGroup, { isLoading: isUpdating }] = useUpdateCustomerGroupMutation();

  const [name, setName] = useState("");
  const [minSpending, setMinSpending] = useState<number | "">("");
  const [maxSpending, setMaxSpending] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [birthdayVoucherId, setBirthdayVoucherId] = useState<number | null>(null);

  const { data: voucherData } = useGetVoucherOptionsQuery({ status: "ACTIVE" }, { skip: !isOpen });

  useEffect(() => {
    if (isOpen && group) {
      setName(group.name || "");
      setMinSpending(group.minSpending ?? "");
      setMaxSpending(group.maxSpending ?? "");
      setDescription(group.description || "");
      setNote(group.note || "");
      setBirthdayVoucherId(group.birthdayVoucherId ?? null);
    }
  }, [isOpen, group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!group) return;

    if (!name.trim()) {
      toast.error("Tên nhóm không được để trống!");
      return;
    }
    if (minSpending === "") {
      toast.error("Chi tiêu tối thiểu không được để trống!");
      return;
    }

    if (maxSpending !== "" && Number(maxSpending) <= Number(minSpending)) {
      toast.error("Chi tiêu tối đa phải lớn hơn chi tiêu tối thiểu!");
      return;
    }

    try {
      await updateCustomerGroup({
        id: group.id,
        data: {
          code: group.code,
          name,
          minSpending: Number(minSpending),
          maxSpending: maxSpending !== "" ? Number(maxSpending) : null,
          description,
          note,
          birthdayVoucherId: birthdayVoucherId,
          status: group.status || "ACTIVE",
        },
      }).unwrap();
      
      toast.success("Cập nhật nhóm khách hàng thành công!");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi cập nhật nhóm khách hàng!");
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-blue-600"></i>
            Sửa thông tin Hạng thẻ
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 block mb-0.5">Hạng thẻ (Code)</span>
              <span className="font-bold text-gray-800">{group.code}</span>
            </div>
            <i className="fa-solid fa-lock text-gray-400" title="Không thể đổi mã hạng thẻ"></i>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tên nhóm khách hàng"
                labelClassName="text-gray-700 after:content-['*'] after:text-rose-500 after:ml-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Khách VIP RUBY"
              />
              <Input
                label="Chi tiêu tối thiểu"
                labelClassName="text-gray-700 after:content-['*'] after:text-rose-500 after:ml-1"
                type="number"
                value={minSpending}
                onChange={(e) => setMinSpending(e.target.value ? Number(e.target.value) : "")}
                placeholder="50,000,000"
              />
            </div>

            <Input
              label="Chi tiêu tối đa (Không bắt buộc)"
              labelClassName="text-gray-700"
              type="number"
              value={maxSpending}
              onChange={(e) => setMaxSpending(e.target.value ? Number(e.target.value) : "")}
              placeholder="Để trống nếu không giới hạn"
            />

            <Input
              label="Mô tả đặc điểm"
              labelClassName="text-gray-700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cập nhật lại điều kiện..."
            />

            <Input
              label="Ghi chú ưu đãi"
              labelClassName="text-gray-700"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đã hạ điều kiện..."
            />

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                <i className="fa-solid fa-gift text-rose-400 mr-1"></i> Voucher sinh nhật
              </label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                value={birthdayVoucherId ?? ""}
                onChange={(e) => setBirthdayVoucherId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- Không có voucher sinh nhật --</option>
                {(voucherData?.data || []).map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isUpdating} 
              isLoading={isUpdating}
              leftIcon={<i className="fa-solid fa-save"></i>}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
