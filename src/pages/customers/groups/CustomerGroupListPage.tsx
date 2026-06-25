import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchCustomerGroupsQuery } from "@/redux/api/customerApi";
import type { CustomerGroups } from "@/types/customer.types";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function CustomerGroupListPage() {
  const navigate = useNavigate();

  // State cho bộ lọc
  const [keyword, setKeyword] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);

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
      case "BRONZE":
        return <i className="fa-solid fa-award text-[12px] text-orange-700"></i>;
      case "SILVER":
        return <i className="fa-solid fa-medal text-[12px] text-slate-700"></i>;
      case "GOLD":
        return <i className="fa-solid fa-crown text-[12px] text-amber-700"></i>;
      default:
        return <i className="fa-solid fa-users text-[12px] text-blue-600"></i>;
    }
  };

  // Cấu hình các cột cho Bảng
  const columns: Column<CustomerGroups>[] = [
    {
      key: "id",
      header: "ID",
      className: "text-center w-12",
      render: (row) => (
        <span className="text-gray-400 font-mono text-[11px]">#{row.id}</span>
      ),
    },
    {
      key: "name",
      header: "Tên nhóm (name)",
      className: "w-48",
      render: (row) => (
        <button 
          onClick={() => navigate(`/customers/groups/${row.id}`)}
          className="flex items-center gap-1.5 font-bold text-gray-800 hover:text-blue-600 transition-colors text-left"
          title="Xem chi tiết nhóm"
        >
          {getGroupIcon(row.code)} {row.name}
        </button>
      ),
    },
    {
      key: "code",
      header: "Mã hạng thẻ",
      className: "w-28",
      render: (row) => (
        <span className="font-mono text-[11px] text-gray-500">{row.code}</span>
      ),
    },
    {
      key: "description",
      header: "Mô tả đặc điểm",
      render: (row) => (
        <div className="text-gray-600 max-w-xs truncate text-[11px]">
          {row.description}
          {row.note && (
            <span className="text-[9px] text-purple-600 block font-bold italic mt-0.5">
              (Note: {row.note})
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
        <span className="font-mono text-gray-900">
          {row.minSpending.toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      key: "maxSpending",
      header: "Chi tiêu tối đa",
      className: "text-right",
      render: (row) => {
        const isInfinite = row.maxSpending >= 999999999;
        return isInfinite ? (
          <span className="text-gray-400 font-mono italic text-[11px]">Vô cực</span>
        ) : (
          <span className="font-mono text-gray-900">
            {row.maxSpending.toLocaleString("vi-VN")}đ
          </span>
        );
      },
    },
    {
      key: "totalCustomers",
      header: "Thành viên",
      className: "text-center w-32",
      render: (row) => (
        <span
          className={`font-semibold px-2 py-1 rounded-md text-[11px] ${
            row.totalCustomers > 0
              ? "text-blue-600 bg-blue-50 font-bold"
              : "text-gray-500"
          }`}
        >
          {row.totalCustomers} KH
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "text-center w-24",
      render: (row) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "danger"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-center w-24",
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
          <i className="fa-solid fa-layer-group text-blue-600"></i> Tra cứu Nhóm khách hàng
        </h1>
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

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold shrink-0">
            <label htmlFor="filter-size" className="whitespace-nowrap uppercase tracking-wider text-gray-400">
              Hiển thị:
            </label>
            <select
              id="filter-size"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-gray-700 cursor-pointer"
            >
              <option value="10">10 dòng</option>
              <option value="20">20 dòng</option>
              <option value="50">50 dòng</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden relative">
        <Table
          columns={columns}
          data={groups}
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
        />
      </div>
    </div>
  );
}
