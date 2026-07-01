import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchCustomerGroupsQuery, useSyncCustomerRanksMutation, useTriggerBirthdayVouchersMutation } from "@/redux/api/customerApi";
import type { CustomerGroups } from "@/types/customer.types";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

import CustomerGroupCreateModal from "./components/CustomerGroupCreateModal";
import VoucherCreateModal from "./components/VoucherCreateModal";

export default function CustomerGroupListPage() {
  const navigate = useNavigate();

  // State cho bộ lọc
  const [keyword, setKeyword] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);

  // State modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const [syncCustomerRanks, { isLoading: isSyncing }] = useSyncCustomerRanksMutation();
  const [triggerBirthdayVouchers, { isLoading: isTriggering }] = useTriggerBirthdayVouchersMutation();

  const handleSync = async () => {
    try {
      await syncCustomerRanks().unwrap();
      toast.success("Đồng bộ hạng thẻ thành công!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi đồng bộ hạng!");
    }
  };

  const handleTriggerBirthday = async () => {
    try {
      await triggerBirthdayVouchers().unwrap();
      toast.success("Gửi voucher sinh nhật thành công!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi gửi voucher sinh nhật!");
    }
  };

  // Gọi API
  const { data: responseData, isLoading, isFetching } = useSearchCustomerGroupsQuery({
    keyword,
    page,
    size,
  });

  const groups = responseData?.data?.content || [];
  const totalElements = responseData?.data?.totalElements || 0;
  const totalPages = responseData?.data?.totalPages || 0;

  // Hàm helper chọn Icon dựa theo mã
  const getGroupIcon = (code: string) => {
    switch (code) {
      case "MEMBER":
        return <i className="fa-solid fa-user text-[12px] text-gray-500"></i>;
      case "BRONZE":
        return <i className="fa-solid fa-award text-[12px] text-orange-700"></i>;
      case "SILVER":
        return <i className="fa-solid fa-medal text-[12px] text-slate-700"></i>;
      case "GOLD":
        return <i className="fa-solid fa-crown text-[12px] text-amber-700"></i>;
      case "PLATINUM":
        return <i className="fa-solid fa-star text-[12px] text-teal-600"></i>;
      case "RUBY":
        return <i className="fa-solid fa-gem text-[12px] text-rose-600"></i>;
      case "DIAMOND":
        return <i className="fa-solid fa-gem text-[12px] text-blue-400"></i>;
      case "BLACK":
        return <i className="fa-solid fa-gem text-[12px] text-gray-900"></i>;
      default:
        return <i className="fa-solid fa-users text-[12px] text-blue-600"></i>;
    }
  };

  // Cấu hình các cột cho Bảng
  const columns: Column<CustomerGroups & { stt?: number }>[] = [
    {
      key: "stt",
      header: "STT",
      className: "text-center w-12",
      render: (row) => (
        <span className="text-gray-500 text-[11px] font-semibold">{row.stt}</span>
      ),
    },
    {
      key: "name",
      header: "Tên nhóm",
      className: "w-48",
      render: (row) => (
        <button
          onClick={() => navigate(`/customers/groups/${row.id}`)}
          className="flex items-center gap-1.5 font-bold text-gray-800 hover:text-blue-600 transition-colors text-left"
          title="Xem chi tiết nhóm"
        >
          {getGroupIcon(row.code)} {row.name.replace(/\s*\([A-Za-z]+\)/g, '')}
        </button>
      ),
    },
    {
      key: "code",
      header: "Hạng thẻ",
      className: "w-28 whitespace-nowrap",
      render: (row) => {
        let variant = "info";
        let label = row.code;

        switch (row.code) {
          case "MEMBER": label = "Thành Viên"; variant = "secondary"; break;
          case "BRONZE": label = "Đồng"; variant = "info"; break;
          case "SILVER": label = "Bạc"; variant = "default"; break;
          case "GOLD": label = "Vàng"; variant = "warning"; break;
          case "PLATINUM": label = "Bạch Kim"; variant = "success"; break;
          case "RUBY": label = "Ruby"; variant = "destructive"; break;
          case "DIAMOND": label = "Kim Cương"; variant = "info"; break;
          case "BLACK": label = "Thẻ Đen"; variant = "secondary"; break;
        }

        return (
          <Badge variant={variant as any}>
            {label}
          </Badge>
        );
      },
    },
    {
      key: "description",
      header: "Mô tả đặc điểm",
      render: (row) => (
        <div className="text-gray-600 max-w-xs truncate text-[11px]">
          {row.description}
          {row.note && (
            <span className="text-[9px] text-purple-600 block font-bold italic mt-0.5">
              (Ghi chú: {row.note})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "minSpending",
      header: "Chi tiêu tối thiểu",
      className: "text-right",
      render: (row) => (
        <span className="font-bold text-gray-900">
          {new Intl.NumberFormat("vi-VN").format(row.minSpending || 0)} ₫
        </span>
      ),
    },
    {
      key: "maxSpending",
      header: "Chi tiêu tối đa",
      className: "text-right",
      render: (row) => {
        const isInfinite = !row.maxSpending || row.maxSpending >= 999999999;
        return isInfinite ? (
          <span className="text-gray-400 italic text-[11px]">Vô cực</span>
        ) : (
          <span className="font-bold text-gray-900">
            {(row.maxSpending || 0).toLocaleString("vi-VN")} <span className="underline">₫</span>
          </span>
        );
      },
    },
    {
      key: "totalCustomers",
      header: "Thành viên",
      className: "text-center w-32 whitespace-nowrap",
      render: (row) => (
        <span
          className={`font-semibold px-2 py-1 rounded-md text-[11px] transition-colors ${row.totalCustomers > 0
            ? "text-blue-600 bg-blue-50 font-bold hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
            : "text-gray-500"
            }`}
          onClick={() => {
            if (row.totalCustomers > 0) {
              navigate(`/customers/groups/${row.id}/members`);
            }
          }}
        >
          {row.totalCustomers} KH
        </span>
      ),
    },

    {
      key: "actions",
      header: "Thao tác",
      className: "text-center w-24 whitespace-nowrap",
      render: (row) => (
        <button
          onClick={() => navigate(`/customers/groups/${row.id}`)}
          className="p-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-lg transition active:scale-90 shadow-sm"
          title="Xem danh sách khách hàng trong nhóm"
        >
          <i className="fa-solid fa-eye text-xs"></i>
        </button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-blue-600"></i> Nhóm khách hàng
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            isLoading={isSyncing}
            disabled={isSyncing || isTriggering}
            leftIcon={<i className="fa-solid fa-rotate"></i>}
            className="shadow-sm font-bold text-xs"
          >
            Đồng bộ hạng
          </Button>
          <Button
            variant="outline"
            onClick={handleTriggerBirthday}
            isLoading={isTriggering}
            disabled={isSyncing || isTriggering}
            leftIcon={<i className="fa-solid fa-gift"></i>}
            className="shadow-sm font-bold text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Gửi voucher sinh nhật ngay
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/customers/groups/vouchers")}
            leftIcon={<i className="fa-solid fa-ticket"></i>}
            className="shadow-sm font-bold text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            Danh sách Voucher
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<i className="fa-solid fa-plus"></i>}
            className="shadow-sm font-bold text-xs"
          >
            Thêm hạng thẻ
          </Button>
        </div>
      </header>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full max-w-md">
          <Input
            placeholder="Nhập tên hoặc mã nhóm khách hàng để lọc nhanh... (keyword)"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            leftIcon={<i className="fa-solid fa-magnifying-glass text-gray-400"></i>}
          />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden relative">
        <Table
          columns={columns}
          data={groups.map((g, index) => ({ ...g, stt: page * size + index + 1 }))}
          isLoading={isLoading || isFetching}
          emptyText="Không tìm thấy nhóm khách hàng nào!"
        />

        {/* PHÂN TRANG CUSTOM */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={(newPage) => setPage(newPage)}
          onSizeChange={(newSize) => {
            setSize(newSize);
            setPage(0);
          }}
        />
      </div>

      {/* Modal Thêm Mới */}
      <CustomerGroupCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <VoucherCreateModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />
    </div>
  );
}
