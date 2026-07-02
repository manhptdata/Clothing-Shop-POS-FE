import React, { useState } from "react";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useNavigate } from "react-router-dom";
import { useGetVoucherHistoryQuery } from "@/redux/api/customerApi";
import { CustomerVoucherHistoryResponse } from "@/types/customer.types";
import { formatDateTime } from "@/utils/formatters";

export default function VoucherHistoryPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Gọi API lấy lịch sử phát voucher
  const { data: responseData, isLoading, isFetching } = useGetVoucherHistoryQuery({
    keyword,
    page,
    size,
  });

  const histories = responseData?.data?.content || [];
  const totalElements = responseData?.data?.totalElements || 0;
  const totalPages = responseData?.data?.totalPages || 0;

  const columns: Column<CustomerVoucherHistoryResponse & { stt?: number }>[] = [
    {
      key: "stt",
      header: "STT",
      className: "text-center w-12",
      render: (row) => (
        <span className="text-gray-500 text-[11px] font-semibold">{row.stt}</span>
      ),
    },
    {
      key: "customerName",
      header: "Tên khách hàng",
      render: (row) => (
        <div>
          <div 
            className="font-bold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => navigate(`/customers/${row.customerId}`)}
            title="Xem hồ sơ khách hàng"
          >
            {row.customerName}
          </div>
          <div className="text-xs text-gray-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "voucherName",
      header: "Chương trình Voucher",
      render: (row) => (
        <span className="font-bold text-gray-800">{row.voucherName}</span>
      ),
    },
    {
      key: "voucherCode",
      header: "Mã Voucher",
      render: (row) => (
        <Badge variant="warning" className="font-mono">{row.voucherCode}</Badge>
      ),
    },
    {
      key: "receivedAt",
      header: "Ngày nhận",
      render: (row) => (
        <span className="text-gray-700">{row.receivedAt ? formatDateTime(row.receivedAt) : "-"}</span>
      ),
    },
    {
      key: "expiredAt",
      header: "Hạn sử dụng",
      render: (row) => (
        <span className="text-rose-600 font-semibold">{row.expiredAt ? formatDateTime(row.expiredAt) : "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => {
        let variant: any = "default";
        let label = "Chưa rõ";
        switch (row.status) {
          case "UNUSED":
            variant = "success";
            label = "Chưa sử dụng";
            break;
          case "USED":
            variant = "secondary";
            label = "Đã sử dụng";
            break;
          case "EXPIRED":
            variant = "destructive";
            label = "Đã hết hạn";
            break;
        }
        return <Badge variant={variant}>{label}</Badge>;
      },
    }
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-blue-600"></i> Lịch sử phát Voucher
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/customers/groups/vouchers")}
            leftIcon={<i className="fa-solid fa-arrow-left"></i>}
            className="shadow-sm font-bold text-xs"
          >
            Quản lý Voucher
          </Button>
        </div>
      </header>

      {/* TOOLBAR TÌM KIẾM & LỌC */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Tìm theo tên KH, SĐT hoặc mã voucher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden relative">
        <Table
          columns={columns}
          data={histories.map((h: any, index: number) => ({ ...h, stt: page * size + index + 1 }))}
          isLoading={isLoading || isFetching}
          emptyText="Chưa có dữ liệu lịch sử phát voucher."
        />
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
    </div>
  );
}
