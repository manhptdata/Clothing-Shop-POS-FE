import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCustomerGroupMembersQuery,
  useGetCustomerGroupByIdQuery,
} from "@/redux/api/customerApi";
import type { Customer, CustomerWithEmail, CustomerVoucher } from "@/types/customer.types";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function CustomerGroupMembersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State cho bộ lọc
  const [keyword, setKeyword] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherData, setSelectedVoucherData] = useState<{
    name: string;
    group: string;
    vouchers: CustomerVoucher[];
  } | null>(null);

  const openVoucherModal = (customer: Customer) => {
    setSelectedVoucherData({
      name: customer.fullName,
      group: customer.customerGroup?.code || "CHƯA XẾP HẠNG",
      vouchers: customer.vouchers || [],
    });
    setIsModalOpen(true);
  };

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
      render: (row) => <span className="text-gray-500 text-[11px] font-semibold">{row.stt}</span>,
    },
    {
      key: "fullName",
      header: "Khách hàng",
      render: (row) => (
        <span
          className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors inline-block"
          onClick={() => navigate(`/customers/${row.id}`)}
        >
          {row.fullName}
        </span>
      )
    },
    {
      key: "phone",
      header: "Số điện thoại",
      render: (row) => <span className="text-gray-900 font-semibold">{row.phone}</span>
    },
    {
      key: "group",
      header: "Hạng",
      render: (row) => {
        const cus = row;
        const code = cus.customerGroup?.code;
        if (!code) {
          return <span className="text-gray-400 text-[11px] font-medium whitespace-nowrap">Chưa xếp hạng</span>;
        }

        const variant = code === "GOLD" ? "warning" : code === "SILVER" ? "default" : "info";
        return (
          <Badge variant={variant as any}>
            {code === 'BRONZE' ? 'Đồng' : code === 'SILVER' ? 'Bạc' : code === 'GOLD' ? 'Vàng' : code}
          </Badge>
        );
      }
    },
    {
      key: "points",
      header: "Điểm tích lũy",
      render: (row) => (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-800">
          <i className="fa-solid fa-star text-yellow-400"></i> {row.rewardPoints?.toLocaleString() || 0}
        </span>
      )
    },
    {
      key: "vouchers",
      header: "Ưu đãi",
      render: (row) => (
        <button
          onClick={() => openVoucherModal(row as Customer)}
          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-[11px] font-bold transition"
        >
          <i className="fa-solid fa-ticket-simple"></i> {row.vouchers?.length || 0} Voucher
        </button>
      )
    },
    {
      key: "note",
      header: "Ghi chú",
      className: "max-w-[150px]",
      render: (row) => (
        <div className="text-gray-500 italic text-[12px] truncate" title={row.note || ""}>
          {row.note || "---"}
        </div>
      )
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-center w-24",
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => navigate(`/customers/${row.id}`)}
            className="p-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-lg transition border border-gray-200"
            title="Xem chi tiết"
          >
            <i className="fa-solid fa-eye text-xs"></i>
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div>

          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-users text-slate-700"></i> Thành viên
            nhóm:
            <span className="text-slate-700 ml-1">{groupName.replace(/\s*\([A-Za-z]+\)/g, '')}</span>
          </h1>
        </div>
      </header>

      {/* FILTER TÌM KIẾM */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            leftIcon={<i className="fa-solid fa-arrow-left"></i>}
            onClick={() => navigate(-1)}
          >
            Quay lại
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
          onSizeChange={(newSize) => {
            setSize(newSize);
            setPage(0);
          }}
        />
      </div>

      {isModalOpen && selectedVoucherData && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Danh sách ưu đãi"
          size="md"
        >
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium">
              Khách hàng: <span className="text-gray-900 font-bold">{selectedVoucherData.name}</span>
            </p>
          </div>
          <div className="max-h-[380px] overflow-y-auto space-y-3.5 pr-2">
            {selectedVoucherData.vouchers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 italic flex flex-col items-center gap-2">
                <i className="fa-solid fa-ticket-simple text-2xl text-gray-300"></i>
                <span>Khách hàng này hiện chưa sở hữu mã ưu đãi nào.</span>
              </div>
            ) : (
              selectedVoucherData.vouchers.map((v) => (
                <div key={v.id} className="relative bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/80 rounded-xl p-3 flex justify-between shadow-sm">
                  <div className="pl-2 space-y-0.5">
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">{v.voucherCode}</span>
                    <div className="text-xs font-bold text-gray-900 mt-1">{v.voucherName}</div>
                    <div className="text-sm font-black text-red-600">Giảm: {v.discountAmount.toLocaleString()}đ</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
