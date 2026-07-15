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
  const [discountType, setDiscountType] = useState<'FIXED_AMOUNT' | 'PERCENTAGE'>('FIXED_AMOUNT');
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">("");
  const [minOrderValue, setMinOrderValue] = useState<number | "">("");

  // Reset form khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      setName("");
      setCode("");
      setDiscountType('FIXED_AMOUNT');
      setDiscountAmount("");
      setMaxDiscountAmount("");
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
    if (discountType === 'PERCENTAGE' && Number(discountAmount) > 100) {
      toast.error("Phần trăm giảm giá không được vượt quá 100%!");
      return;
    }
    if (minOrderValue === "" || Number(minOrderValue) < 0) {
      toast.error("Vui lòng nhập giá trị đơn hàng tối thiểu hợp lệ!");
      return;
    }
    if (discountType === 'FIXED_AMOUNT' && Number(discountAmount) >= Number(minOrderValue) && Number(minOrderValue) > 0) {
      // Chỉ cảnh báo, không block
      toast("Lưu ý: Mức giảm giá đang lớn hơn hoặc bằng giá trị đơn hàng tối thiểu", { icon: "⚠️" });
    }

    try {
      await createVoucher({
        name,
        code,
        discountType,
        discountAmount: Number(discountAmount),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
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

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-700 font-medium after:content-['*'] after:text-rose-500 after:ml-1">Loại giảm giá</label>
            <select
              className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors outline-none bg-white"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'FIXED_AMOUNT' | 'PERCENTAGE')}
            >
              <option value="FIXED_AMOUNT">Giảm số tiền cố định (VNĐ)</option>
              <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
            </select>
          </div>

          <Input
            label={discountType === 'FIXED_AMOUNT' ? "Số tiền giảm giá (VNĐ)" : "Phần trăm giảm giá (%)"}
            labelClassName="text-gray-700 after:content-['*'] after:text-rose-500 after:ml-1"
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder={discountType === 'FIXED_AMOUNT' ? "VD: 50000" : "VD: 10"}
          />

          {discountType === 'PERCENTAGE' && (
            <Input
              label="Mức giảm tối đa (VNĐ)"
              labelClassName="text-gray-700"
              type="number"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="VD: 100000 (Để trống nếu không giới hạn)"
            />
          )}

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
