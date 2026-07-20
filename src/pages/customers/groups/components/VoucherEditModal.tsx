import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUpdateVoucherMutation, useGetCustomerGroupsQuery } from "@/redux/api/customerApi";

interface VoucherEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: any; // { id, name, code, ... }
}

export default function VoucherEditModal({ isOpen, onClose, voucher }: VoucherEditModalProps) {
  const [updateVoucher, { isLoading }] = useUpdateVoucherMutation();
  const { data: customerGroupsData } = useGetCustomerGroupsQuery();
  const customerGroups = customerGroupsData?.data?.content || [];

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<'FIXED_AMOUNT' | 'PERCENTAGE'>('FIXED_AMOUNT');
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">("");
  const [minOrderValue, setMinOrderValue] = useState<number | "">("");
  const [isPublic, setIsPublic] = useState(false);
  const [targetCustomerGroupId, setTargetCustomerGroupId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalQuantity, setTotalQuantity] = useState<number | "">("");
  const [maxUsagePerUser, setMaxUsagePerUser] = useState<number | "">("");
  const [applyType, setApplyType] = useState<'ALL' | 'CATEGORY' | 'PRODUCT'>('ALL');

  // Populate data when modal opens
  useEffect(() => {
    if (isOpen && voucher) {
      setName(voucher.name || "");
      setCode(voucher.code || "");
      setDiscountType(voucher.discountType || 'FIXED_AMOUNT');
      setDiscountAmount(voucher.discountAmount || "");
      setMaxDiscountAmount(voucher.maxDiscountAmount || "");
      setMinOrderValue(voucher.minOrderValue || "");
      setIsPublic(voucher.isPublic || false);
      setTargetCustomerGroupId(voucher.targetCustomerGroupId || "");
      setStartDate(voucher.startDate ? voucher.startDate.slice(0, 16) : "");
      setEndDate(voucher.endDate ? voucher.endDate.slice(0, 16) : "");
      setTotalQuantity(voucher.totalQuantity ?? "");
      setMaxUsagePerUser(voucher.maxUsagePerUser ?? "");
      setApplyType(voucher.applyType || 'ALL');
    }
  }, [isOpen, voucher]);

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
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
      return;
    }

    try {
      await updateVoucher({
        id: voucher.id,
        data: {
          name,
          code,
          discountType,
          discountAmount: Number(discountAmount),
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
          minOrderValue: Number(minOrderValue),
          isPublic,
          targetCustomerGroupId: !isPublic && targetCustomerGroupId ? Number(targetCustomerGroupId) : null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          totalQuantity: totalQuantity ? Number(totalQuantity) : null,
          maxUsagePerUser: maxUsagePerUser ? Number(maxUsagePerUser) : null,
          applyType,
        },
      }).unwrap();

      toast.success("Cập nhật Voucher thành công!");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi cập nhật Voucher!");
    }
  };

  if (!isOpen || !voucher) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-pen text-blue-600"></i>
            Chỉnh sửa Voucher
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
          {/* PHÂN LOẠI PUBLIC / PRIVATE */}
          <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <div>
              <span className="font-bold text-gray-800 block">Voucher Công Khai (Public)</span>
              <span className="text-xs text-gray-500">Bất kỳ khách hàng nào cũng có thể áp dụng</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* NẾU LÀ PRIVATE VOUCHER -> CHỌN NHÓM KHÁCH HÀNG */}
          {!isPublic && (
            <div className="flex flex-col gap-1.5 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 animate-in fade-in duration-200">
              <label className="text-amber-900 font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-users text-amber-600"></i> Nhóm Khách Hàng Áp Dụng (Private)
              </label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors outline-none bg-white text-gray-800 font-medium"
                value={targetCustomerGroupId}
                onChange={(e) => setTargetCustomerGroupId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Tất cả thành viên (Private không giới hạn nhóm)</option>
                {customerGroups.map((g: any) => (
                  <option key={g.id} value={g.id}>
                    Chỉ nhóm: {g.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-amber-700">Chỉ những khách hàng thuộc nhóm được chọn mới có thể sử dụng mã này.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {discountType === 'PERCENTAGE' ? (
              <Input
                label="Mức giảm tối đa (VNĐ)"
                labelClassName="text-gray-700"
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : "")}
                placeholder="VD: 100000 (Để trống nếu không giới hạn)"
              />
            ) : <div />}

            <Input
              label="Giá trị đơn tối thiểu"
              labelClassName="text-gray-700 after:content-['*'] after:text-rose-500 after:ml-1"
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value ? Number(e.target.value) : "")}
              placeholder="VD: 200000 (Nhập 0 nếu không giới hạn)"
            />
          </div>

          {/* SỐ LƯỢNG VÀ LƯỢT DÙNG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Tổng số lượng phát hành"
              labelClassName="text-gray-700"
              type="number"
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(e.target.value ? Number(e.target.value) : "")}
              placeholder="VD: 100 (Để trống nếu không giới hạn)"
            />

            <Input
              label="Tối đa lượt dùng / 1 Khách"
              labelClassName="text-gray-700"
              type="number"
              value={maxUsagePerUser}
              onChange={(e) => setMaxUsagePerUser(e.target.value ? Number(e.target.value) : "")}
              placeholder="VD: 1 (Để trống nếu không giới hạn)"
            />
          </div>

          {/* THỜI GIÁN BẮT ĐẦU & KẾT THÚC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-medium">Thời gian bắt đầu</label>
              <input
                type="datetime-local"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors outline-none bg-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-medium">Thời gian kết thúc</label>
              <input
                type="datetime-local"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors outline-none bg-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading} 
              isLoading={isLoading}
              leftIcon={<i className="fa-solid fa-check"></i>}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
