import React from "react";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGetVoucherOptionsQuery, useToggleVoucherStatusMutation } from "@/redux/api/customerApi";

import VoucherCreateModal from "../groups/components/VoucherCreateModal";
import VoucherEditModal from "../groups/components/VoucherEditModal";

export default function VoucherListPage() {
  const navigate = useNavigate();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = React.useState(false);
  const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);

  // Gọi API lấy danh sách voucher
  const { data: responseData, isLoading, isFetching } = useGetVoucherOptionsQuery();
  const [toggleStatus] = useToggleVoucherStatusMutation();

  const [keyword, setKeyword] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const vouchers = responseData?.data || [];

  const filteredVouchers = React.useMemo(() => {
    return vouchers.filter((v: any) => {
      const matchKeyword = (v.name?.toLowerCase() || "").includes(keyword.toLowerCase()) || 
                           (v.code?.toLowerCase() || "").includes(keyword.toLowerCase());
      const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [vouchers, keyword, statusFilter]);

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "STT",
      render: (row) => {
        const index = filteredVouchers.findIndex((v: any) => v.id === row.id);
        return <span className="text-gray-700 font-semibold">{index + 1}</span>;
      },
      className: "w-20",
    },
    {
      key: "name",
      header: "Tên chương trình voucher",
      render: (row) => (
        <span className="font-bold text-gray-800">{row.name}</span>
      ),
    },
    {
      key: "code",
      header: "Mã Voucher",
      render: (row) => (
        <Badge variant="warning" className="font-mono">{row.code}</Badge>
      ),
    },
    {
      key: "discountAmount",
      header: "Giảm giá",
      render: (row) => (
        <span className="text-gray-900 font-bold">
          {row.discountType === 'PERCENTAGE' ? (
            <>
              {row.discountAmount}% 
              {row.maxDiscountAmount && <span className="text-xs text-gray-500 block font-normal">(Tối đa {row.maxDiscountAmount.toLocaleString("vi-VN")}đ)</span>}
            </>
          ) : (
            <>{row.discountAmount ? <>{row.discountAmount.toLocaleString("vi-VN")} <u>đ</u></> : "-"}</>
          )}
        </span>
      ),
    },
    {
      key: "isPublic",
      header: "Phân loại",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.isPublic ? "success" : "secondary"}>
            {row.isPublic ? "Public" : "Private"}
          </Badge>
          {!row.isPublic && row.targetCustomerGroupId && (
            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
              ID nhóm: #{row.targetCustomerGroupId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "duration",
      header: "Thời hạn",
      render: (row) => {
        const formatDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;
        const start = formatDate(row.startDate);
        const end = formatDate(row.endDate);

        if (!start && !end) return <span className="text-gray-400 text-xs font-normal">Vô thời hạn</span>;
        return (
          <div className="text-xs text-gray-700 flex flex-col font-mono leading-tight">
            <span>{start ? `Từ: ${start}` : "Tự do"}</span>
            <span>{end ? `Đến: ${end}` : "Không Hạn"}</span>
          </div>
        );
      },
    },
    {
      key: "quantity",
      header: "Lượt dùng",
      render: (row) => {
        const isFull = row.totalQuantity && (row.usedQuantity || 0) >= row.totalQuantity;
        return (
          <span className={`text-xs font-medium ${isFull ? "text-rose-600 font-bold" : "text-gray-800"}`}>
            {row.usedQuantity || 0} / {row.totalQuantity ? row.totalQuantity : "∞"}
            {isFull && <span className="block text-[10px] text-rose-500 font-normal">Hết lượt</span>}
          </span>
        );
      },
    },
    {
      key: "minOrderValue",
      header: "Đơn tối thiểu",
      render: (row) => (
        <span className="text-gray-800 font-bold">
          {row.minOrderValue ? <>{row.minOrderValue.toLocaleString("vi-VN")} <u>đ</u></> : "Không giới hạn"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "w-36",
      render: (row) => {
        const isActive = row.status === "ACTIVE";
        const now = new Date();
        const isExpired = row.endDate && new Date(row.endDate) < now;
        const isUpcoming = row.startDate && new Date(row.startDate) > now;
        const isFull = row.totalQuantity && (row.usedQuantity || 0) >= row.totalQuantity;

        let statusText = "Đang bật";
        let statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";

        if (!isActive) {
          statusText = "Đã tắt";
          statusBadgeClass = "bg-gray-100 text-gray-500 border-gray-200";
        } else if (isExpired) {
          statusText = "Hết hạn";
          statusBadgeClass = "bg-rose-50 text-rose-600 border-rose-200";
        } else if (isUpcoming) {
          statusText = "Sắp chạy";
          statusBadgeClass = "bg-amber-50 text-amber-600 border-amber-200";
        } else if (isFull) {
          statusText = "Hết lượt";
          statusBadgeClass = "bg-rose-50 text-rose-600 border-rose-200";
        }

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const res = await toggleStatus(row.id).unwrap();
                    toast.success(res.message || "Thay đổi trạng thái thành công!");
                  } catch (error: any) {
                    toast.error(error?.data?.message || "Lỗi khi đổi trạng thái!");
                  }
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isActive ? "bg-blue-600" : "bg-gray-200"
                  }`}
                role="switch"
                aria-checked={isActive}
              >
                <span className="sr-only">Toggle status</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </button>
              <span className={`text-xs border px-1.5 py-0.5 rounded font-semibold ${statusBadgeClass}`}>
                {statusText}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "w-24 text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setSelectedVoucher(row)}
            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
            title="Sửa"
          >
            <i className="fa-solid fa-pen text-xs"></i>
          </button>
        </div>
      ),
    }
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <i className="fa-solid fa-ticket text-rose-600"></i> Quản lý Voucher
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/customers/groups")}
            leftIcon={<i className="fa-solid fa-arrow-left"></i>}
            className="shadow-sm font-bold text-xs"
          >
            Quay lại
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/customers/groups/vouchers/history")}
            leftIcon={<i className="fa-solid fa-clock-rotate-left"></i>}
            className="shadow-sm font-bold text-xs"
          >
            Lịch sử phát
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsVoucherModalOpen(true)}
            leftIcon={<i className="fa-solid fa-plus"></i>}
            className="shadow-sm font-bold text-xs"
          >
            Thêm Voucher mới
          </Button>
        </div>
      </header>

      {/* TOOLBAR TÌM KIẾM & LỌC */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã voucher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Trạng thái:</span>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px] cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="ACTIVE">Đang bật</option>
            <option value="INACTIVE">Đã tắt</option>
          </select>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden relative">
        <Table
          columns={columns}
          data={filteredVouchers}
          isLoading={isLoading || isFetching}
          emptyText="Chưa có voucher nào trong hệ thống."
        />
      </div>

      <VoucherCreateModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />

      <VoucherEditModal
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        voucher={selectedVoucher}
      />
    </div>
  );
}
