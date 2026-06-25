import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  useSearchCustomersQuery,
  useDeactivateCustomerMutation,
  useActivateCustomerMutation 
} from "@/redux/api/customerApi";
import type { Customer, CustomerVoucher } from "@/types/customer.types";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function CustomerListPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherData, setSelectedVoucherData] = useState<{
    name: string;
    group: string;
    vouchers: CustomerVoucher[];
  } | null>(null);

  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useSearchCustomersQuery({
    keyword,
    page,
    size,
  });

  const customers = responseData?.data?.content || [];
  const totalElements = responseData?.data?.totalElements || 0;
  const totalPages = responseData?.data?.totalPages || 0;

  const handleSearch = () => {
    setPage(0);
  };

  const openVoucherModal = (customer: Customer) => {
    setSelectedVoucherData({
      name: customer.fullName,
      group: customer.customerGroup?.code || "GỖ MỚI",
      vouchers: customer.vouchers || [],
    });
    setIsModalOpen(true);
  };

  const [deactivateCustomer] = useDeactivateCustomerMutation();
  const [activateCustomer] = useActivateCustomerMutation();

  const handleToggleStatus = async (
    id: number,
    currentStatus: string,
    name: string,
  ) => {
    const action = currentStatus === "ACTIVE" ? "Xóa" : "Kích hoạt lại";
    if (
      window.confirm(`Hệ thống POS: Xác nhận ${action} khách hàng: ${name}?`)
    ) {
      try {
        if (currentStatus === "ACTIVE") {
          await deactivateCustomer(id).unwrap();
        } else {
          await activateCustomer(id).unwrap();
        }
        alert(`${action} thành công!`);
      } catch (error: any) {
        console.error(error);
        const errorMsg = error?.data?.message || error?.error || "Lỗi không xác định";
        alert(`${action} thất bại! Lỗi Server: ${errorMsg}`);
      }
    }
  };

  // Tính toán thêm STT vào data
  const tableData = customers.map((cus, index) => ({
    ...cus,
    stt: page * size + index + 1
  }));

  // Định nghĩa cấu trúc các cột cho Table Component
  const columns: Column<typeof tableData[0]>[] = [
    {
      key: "id",
      header: "STT",
      className: "text-center w-12",
      render: (row) => <span className="text-gray-500 font-mono text-[11px] font-semibold">{row.stt}</span>
    },
    {
      key: "fullName",
      header: "Khách hàng",
      render: (row) => (
        <span 
          className="font-bold text-gray-900 hover:text-gray-700 cursor-pointer transition-colors"
          onClick={() => navigate(`/customers/${row.id}`)}
        >
          {row.fullName}
        </span>
      )
    },
    {
      key: "phone",
      header: "Số điện thoại",
      render: (row) => <span className="font-mono text-gray-900 font-semibold">{row.phone}</span>
    },
    {
      key: "info",
      header: "Thông tin",
      render: (row) => (
        <div className="font-normal text-gray-500 flex flex-col lg:flex-row lg:items-center gap-1.5">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <i className="fa-solid fa-cake-candles text-gray-400 text-[10px]"></i> {row.dateOfBirth}
          </span>
          <span className="font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded text-[10px] w-fit">
            {row.gender}
          </span>
        </div>
      )
    },
    {
      key: "group",
      header: "Hạng",
      render: (row) => {
        const cus = row;
        const code = cus.customerGroup?.code || "GỖ MỚI";
        const variant = code === "GOLD" ? "warning" : code === "SILVER" ? "default" : "info";
        return (
          <Badge variant={variant as any}>
            {code}
          </Badge>
        );
      }
    },
    {
      key: "points",
      header: "Điểm tích lũy",
      render: (row) => (
        <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-gray-800">
          <i className="fa-solid fa-star text-yellow-400"></i> {row.rewardPoints?.toLocaleString() || 0}
        </span>
      )
    },
    {
      key: "vouchers",
      header: "Ưu đãi",
      render: (row) => (
        <button
          onClick={() => openVoucherModal(row)}
          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-[11px] font-bold transition"
        >
          <i className="fa-solid fa-ticket-simple"></i> {row.vouchers?.length || 0} Voucher
        </button>
      )
    },
    {
      key: "address",
      header: "Địa chỉ & Ghi chú",
      className: "max-w-xs",
      render: (row) => (
        <div className="text-gray-600 truncate">
          <div className="text-gray-900 truncate">{row.address}</div>
          <div className="text-gray-400 italic text-[11px] mt-0.5">{row.note || "Không có ghi chú"}</div>
        </div>
      )
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "text-center w-28",
      render: (row) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "danger"}>
          {row.status}
        </Badge>
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
          >
            <i className="fa-solid fa-eye text-xs"></i>
          </button>
          <button
            onClick={() => handleToggleStatus(row.id, row.status, row.fullName)}
            className="p-1.5 bg-gray-50 text-gray-400 hover:text-rose-600 rounded-lg transition border border-gray-200"
          >
            <i className="fa-solid fa-user-slash text-xs"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 px-6 pb-6 pt-2 max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fa-solid fa-users text-blue-600"></i> Quản lý Khách hàng
        </h1>
      </header>

      {/* TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full max-w-md">
          <Input
            placeholder="Tìm kiếm theo Tên, Số điện thoại..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            leftIcon={<i className="fa-solid fa-magnifying-glass text-gray-400"></i>}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button variant="primary" onClick={() => navigate("/customers/new")} leftIcon={<i className="fa-solid fa-user-plus"></i>}>
            Thêm mới
          </Button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU DÙNG COMPONENT CHUNG */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden relative">
        <Table 
          columns={columns} 
          data={tableData} 
          isLoading={isLoading || isFetching}
          emptyText="Không tìm thấy khách hàng nào!"
        />

        {/* PHÂN TRANG */}
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

      {/* MODAL VOUCHER */}
      {selectedVoucherData && (
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
                    <span className="font-mono text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">{v.voucherCode}</span>
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
