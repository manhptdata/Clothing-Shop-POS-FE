import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCustomerGroupMembersQuery,
  useGetCustomerGroupByIdQuery,
} from "@/redux/api/customerApi";
import type { Customer } from "@/types/customer.types";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function CustomerGroupMembersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State cho bộ lọc
  const [keyword, setKeyword] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);

  // Gọi API lấy TÊN của nhóm (để hiển thị trên Header)
  const { data: groupResponse } = useGetCustomerGroupByIdQuery(id as string, {
    skip: !id,
  });
  const groupName = groupResponse?.data?.name || "Đang tải...";

  // Gọi API lấy DANH SÁCH THÀNH VIÊN
  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useGetCustomerGroupMembersQuery(
    {
      id: id as string,
      keyword,
      page,
      size,
    },
    { skip: !id },
  );

  const members = responseData?.data?.content || [];
  const totalElements = responseData?.data?.totalElements || 0;
  const totalPages = responseData?.data?.totalPages || 0;

  // Tính toán thêm STT vào data
  const tableData = members.map((member, index) => ({
    ...member,
    stt: page * size + index + 1
  }));

  // Cấu hình các cột cho Bảng
  const columns: Column<typeof tableData[0]>[] = [
    {
      key: "id",
      header: "STT",
      className: "text-center w-12",
      render: (row) => <span className="text-gray-500 font-mono text-[11px] font-semibold">{row.stt}</span>,
    },
    {
      key: "fullName",
      header: "Tên khách hàng",
      render: (row) => (
        <button 
          onClick={() => navigate(`/customers/${row.id}`)}
          className="font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer text-left"
          title="Xem chi tiết khách hàng"
        >
          {row.fullName}
        </button>
      ),
    },
    {
      key: "phone",
      header: "Số điện thoại",
      render: (row) => (
        <span className="font-mono text-gray-900 font-semibold">
          {row.phone}
        </span>
      ),
    },
    {
      key: "dob_gender",
      header: "Ngày sinh & Giới tính",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.dateOfBirth && (
            <span className="inline-flex items-center gap-1 text-gray-500 text-[11px]">
              <i className="fa-solid fa-cake-candles text-gray-400"></i>{" "}
              {row.dateOfBirth}
            </span>
          )}
          <span
            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${row.gender === "MALE" ? "text-blue-600 bg-blue-50" : "text-pink-600 bg-pink-50"}`}
          >
            {row.gender}
          </span>
        </div>
      ),
    },
    {
      key: "address",
      header: "Địa chỉ",
      render: (row) => (
        <div
          className="text-gray-600 max-w-[150px] truncate"
          title={row.address}
        >
          {row.address || "--"}
        </div>
      ),
    },
    {
      key: "note",
      header: "Ghi chú",
      render: (row) => (
        <div
          className="text-amber-600 italic max-w-[150px] truncate"
          title={row.note}
        >
          {row.note || "--"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "text-center w-28",
      render: (row) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "danger"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tham gia nhóm",
      className: "text-center w-40",
      render: (row) => (
        <span className="text-gray-400 font-mono text-[11px]">
          {new Date(row.createdAt).toLocaleString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <button
              onClick={() => navigate("/customers/groups")}
              className="hover:text-blue-600 transition"
            >
              Nhóm khách hàng
            </button>
            <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
            <span className="text-gray-900 font-semibold">
              Danh sách thành viên
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-users text-slate-700"></i> Thành viên
            nhóm:
            <span className="text-slate-700 ml-1">{groupName}</span>
          </h1>
        </div>
      </header>

      {/* FILTER TÌM KIẾM */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            leftIcon={<i className="fa-solid fa-arrow-left"></i>}
            onClick={() => navigate(`/customers/groups/${id}`)}
          >
            Quay lại nhóm
          </Button>
        </div>

        <div className="flex-1 w-full max-w-xl mx-0 sm:mx-4">
          <Input
            placeholder="Tìm kiếm thành viên theo Tên hoặc Số điện thoại..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            leftIcon={
              <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            }
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
            <label
              htmlFor="filter-size"
              className="whitespace-nowrap uppercase tracking-wider text-gray-400"
            >
              Hiển thị dòng:
            </label>
            <select
              id="filter-size"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none text-xs font-bold text-gray-700 cursor-pointer"
            >
              <option value="10">10 thành viên</option>
              <option value="20">20 thành viên</option>
              <option value="50">50 thành viên</option>
            </select>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden relative">
        <Table
          columns={columns}
          data={tableData}
          isLoading={isLoading || isFetching}
          emptyText="Không tìm thấy thành viên nào phù hợp!"
        />

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
