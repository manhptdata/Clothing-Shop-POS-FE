import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateVoucherMutation } from "@/redux/api/customerApi";

interface VoucherCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoucherCreateModal({ isOpen, onClose }: VoucherCreateModalProps) {
  const [createVoucher, { isLoading }] = useCreateVoucherMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const [minOrderValue, setMinOrderValue] = useState<number | "">("");

  // Reset form khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      setName("");
      setCode("");
      setDiscountAmount("");
      setMinOrderValue("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên chương trình voucher!");
      return;
    }
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã voucher!");
      return;
    }
    if (discountAmount === "" || Number(discountAmount) <= 0) {
      toast.error("Vui lòng nhập giá trị giảm giá hợp lệ!");
      return;
    }
    if (minOrderValue === "" || Number(minOrderValue) < 0) {
      toast.error("Vui lòng nhập giá trị đơn hàng tối thiểu hợp lệ!");
      return;
    }

    try {
      await createVoucher({
        name,
        code,
        discountAmount: Number(discountAmount),
        minOrderValue: Number(minOrderValue),
      }).unwrap();

      toast.success("Thêm mới Voucher thành công!");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi tạo Voucher!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-ticket text-rose-600"></i>
            Thêm mới Voucher
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <Input
            label="Tên chương trình voucher"
            labelClassName="text-gray-700 after:content-['*'] after:text-rose-500 after:ml-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Quà Sinh Nhật Tháng 8"
          />

          <Input
            label="Mã voucher (Code)"
            labelClassName="text-gray-700 after:content-['*'] after:text-rose-500 after:ml-1"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="VD: SN_T8"
          />

          <Input
            label="Giá trị giảm giá (VNĐ hoặc %)"
            labelClassName="text-gray-700 after:content-['*'] after:text-rose-500 after:ml-1"
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="VD: 50000"
          />

          <Input
            label="Giá trị đơn hàng tối thiểu"
            labelClassName="text-gray-700 after:content-['*'] after:text-rose-500 after:ml-1"
            type="number"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value ? Number(e.target.value) : "")}
            placeholder="VD: 200000 (Nhập 0 nếu không giới hạn)"
          />

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading} 
              isLoading={isLoading}
              leftIcon={<i className="fa-solid fa-plus"></i>}
            >
              Thêm Voucher
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
