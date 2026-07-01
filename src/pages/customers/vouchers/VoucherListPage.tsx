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

  const vouchers = responseData?.data || [];

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => <span className="text-gray-500 font-medium">#{row.id}</span>,
      width: "80px",
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
          {row.discountAmount ? <>{row.discountAmount.toLocaleString("vi-VN")} <u>đ</u></> : "-"}
        </span>
      ),
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
      className: "w-32",
      render: (row) => {
        const isActive = row.status === "ACTIVE";
        return (
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
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                isActive ? "bg-blue-600" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={isActive}
            >
              <span className="sr-only">Toggle status</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${isActive ? "text-blue-600" : "text-gray-500"}`}>
              {isActive ? "Đang bật" : "Đã tắt"}
            </span>
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
            variant="primary"
            onClick={() => setIsVoucherModalOpen(true)}
            leftIcon={<i className="fa-solid fa-plus"></i>}
            className="shadow-sm font-bold text-xs"
          >
            Thêm Voucher mới
          </Button>
        </div>
      </header>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden relative">
        <Table
          columns={columns}
          data={vouchers}
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
