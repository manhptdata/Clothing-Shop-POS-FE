import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateCustomerGroupMutation, useSearchCustomerGroupsQuery, useGetVoucherOptionsQuery } from "@/redux/api/customerApi";

interface CustomerGroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_RANK_CODES = [
  { code: "MEMBER", name: "Hạng Thành Viên", minSpending: 0 },
  { code: "BRONZE", name: "Hạng Đồng", minSpending: 10000000 },
  { code: "SILVER", name: "Hạng Bạc", minSpending: 20000000 },
  { code: "GOLD", name: "Hạng Vàng", minSpending: 30000000 },
  { code: "PLATINUM", name: "Hạng Bạch Kim", minSpending: 40000000 },
  { code: "RUBY", name: "Hạng Ruby", minSpending: 50000000 },
  { code: "DIAMOND", name: "Hạng Kim Cương", minSpending: 100000000 },
  { code: "BLACK", name: "Hạng Thẻ Đen", minSpending: 300000000 },
];

export default function CustomerGroupCreateModal({
  isOpen,
  onClose,
}: CustomerGroupCreateModalProps) {
  // Fetch existing groups to know which ranks are already used
  const { data: searchData, isFetching: isSearching } = useSearchCustomerGroupsQuery({ size: 100 }, { skip: !isOpen });
  const [createCustomerGroup, { isLoading: isCreating }] = useCreateCustomerGroupMutation();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [minSpending, setMinSpending] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [birthdayVoucherId, setBirthdayVoucherId] = useState<number | null>(null);

  const { data: voucherData } = useGetVoucherOptionsQuery({ status: "ACTIVE" }, { skip: !isOpen });

  const existingCodes = searchData?.data?.content?.map(g => g.code) || [];
  const availableRanks = ALL_RANK_CODES.filter(r => !existingCodes.includes(r.code));

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setName("");
      setMinSpending("");
      setDescription("");
      setNote("");
      setBirthdayVoucherId(null);
    }
  }, [isOpen]);

  const handleRankSelect = (selectedCode: string) => {
    const rank = ALL_RANK_CODES.find(r => r.code === selectedCode);
    if (rank) {
      setCode(selectedCode);
      const isMember = selectedCode === "MEMBER";
      setName(isMember ? "Thành Viên Cơ Bản" : rank.name.replace("Hạng ", "Khách VIP "));
      setMinSpending(rank.minSpending);
      setDescription(`Nhóm khách hàng ${rank.name.toLowerCase()}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error("Vui lòng chọn hạng thẻ muốn thêm!");
      return;
    }
    if (!name.trim()) {
      toast.error("Tên nhóm không được để trống!");
      return;
    }
    if (minSpending === "") {
      toast.error("Chi tiêu tối thiểu không được để trống!");
      return;
    }

    try {
      await createCustomerGroup({
        code,
        name,
        minSpending: Number(minSpending),
        description,
        note,
        birthdayVoucherId: birthdayVoucherId ?? undefined,
        status: "ACTIVE",
      }).unwrap();

      toast.success("Thêm nhóm khách hàng thành công!");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi thêm nhóm khách hàng!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-blue-600"></i>
            Thêm mới nhóm khách hàng
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {isSearching ? (
            <div className="py-8 text-center text-gray-500">
              <i className="fa-solid fa-circle-notch fa-spin text-2xl text-blue-500 mb-2"></i>
              <p>Đang tải dữ liệu hạng thẻ...</p>
            </div>
          ) : availableRanks.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <i className="fa-solid fa-check-circle text-4xl text-emerald-500 mb-3 block"></i>
              <p className="font-bold text-gray-700">Tất cả hạng thẻ đã được tạo!</p>
              <p className="text-xs mt-1">Hệ thống hiện không còn hạng thẻ nào khả dụng để thêm mới.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Chọn hạng thẻ (Code) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableRanks.map(rank => (
                    <label
                      key={rank.code}
                      onClick={(e) => { e.preventDefault(); handleRankSelect(rank.code); }}
                      className={`border rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${code === rank.code
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                    >
                      <input type="radio" className="sr-only" checked={code === rank.code} readOnly />
                      <span className="font-bold text-gray-800 text-[13px]">{rank.name}</span>
                      <span className="text-[10px] text-gray-500 font-medium">({rank.code})</span>
                    </label>
                  ))}
                </div>
              </div>

              {code && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
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
                    label="Mô tả đặc điểm"
                    labelClassName="text-gray-700"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="VD: Nhóm khách hàng chi tiêu cực khủng..."
                  />

                  <Input
                    label="Ghi chú ưu đãi"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Ưu đãi giảm 20% mọi đơn hàng..."
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
              )}
            </>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreating || availableRanks.length === 0 || !code}
              isLoading={isCreating}
              leftIcon={<i className="fa-solid fa-plus"></i>}
            >
              Thêm nhóm mới
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
