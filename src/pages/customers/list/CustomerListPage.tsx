import React, { useState, useRef } from "react";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import {
  useSearchCustomersQuery,
  useDeactivateCustomerMutation,
  useActivateCustomerMutation,
  useImportCustomersMutation
} from "@/redux/api/customerApi";
import type { Customer, CustomerVoucher, CustomerWithEmail } from "@/types/customer.types";
import { useAppSelector } from "@/redux/hooks";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function CustomerListPage() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userPerms = user?.permissions || [];
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const hasManageCustomerPermission = isAdmin || userPerms.includes('MANAGE_CUSTOMER');

  const [keyword, setKeyword] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importCustomers, { isLoading: isImporting }] = useImportCustomersMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherData, setSelectedVoucherData] = useState<{
    name: string;
    group: string;
    vouchers: CustomerVoucher[];
  } | null>(null);

  // Thêm state cho Modal xác nhận Xóa/Kích hoạt
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    id: number;
    currentStatus: string;
    name: string;
    action: string;
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await importCustomers(formData).unwrap();
      const successMsg = res?.data?.message || res?.message || "Import thành công!";
      toast.success(successMsg);
    } catch (error: any) {
      const errorMsg = 
        error?.data?.data?.message || 
        error?.data?.message || 
        "Lỗi hệ thống: Import thất bại!";
        
      toast.error(errorMsg);
      console.error("Chi tiết lỗi:", error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [deactivateCustomer] = useDeactivateCustomerMutation();
  const [activateCustomer] = useActivateCustomerMutation();

  const handleToggleStatus = (
    id: number,
    currentStatus: string,
    name: string,
  ) => {
    const action = currentStatus === "ACTIVE" ? "Xóa" : "Kích hoạt lại";
    setConfirmData({ id, currentStatus, name, action });
    setIsConfirmModalOpen(true);
  };

  const confirmAction = async () => {
    if (!confirmData) return;
    try {
      if (confirmData.currentStatus === "ACTIVE") {
        await deactivateCustomer(confirmData.id).unwrap();
      } else {
        await activateCustomer(confirmData.id).unwrap();
      }
      setIsConfirmModalOpen(false);
      setConfirmData(null);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.data?.message || error?.error || "Lỗi không xác định";
      toast.error(`${confirmData.action} thất bại! Lỗi Server: ${errorMsg}`);
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
      render: (row) => <span className="text-gray-500 text-[11px] font-semibold">{row.stt}</span>
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
          return (
            <Badge variant="secondary">
              Thành Viên
            </Badge>
          );
        }

        let variant = "info";
        let label = code;
        
        switch (code) {
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
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (cus.customerGroup?.id) {
                navigate(`/customers/groups/${cus.customerGroup.id}`);
              }
            }}
            className="cursor-pointer hover:opacity-80 transition-opacity inline-block"
            title="Xem chi tiết cấu hình hạng thẻ"
          >
            <Badge variant={variant as any}>
              {label}
            </Badge>
          </div>
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
      render: (row) => {
        const usableVouchers = row.vouchers?.filter(v => v.status === 'UNUSED' && new Date(v.expiredAt) > new Date()) || [];
        return (
          <button
            onClick={() => openVoucherModal(row)}
            className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-[11px] font-bold transition"
          >
            <i className="fa-solid fa-ticket-simple"></i> {usableVouchers.length} Khả dụng
          </button>
        );
      }
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
          {hasManageCustomerPermission && (
            <button
              onClick={() => handleToggleStatus(row.id, row.status, row.fullName)}
              className="p-1.5 bg-gray-50 text-gray-400 hover:text-rose-600 rounded-lg transition border border-gray-200"
              title="Đổi trạng thái"
            >
              <i className="fa-solid fa-user-slash text-xs"></i>
            </button>
          )}
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end">
          {hasManageCustomerPermission && (
            <>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                isLoading={isImporting}
                leftIcon={<i className="fa-solid fa-file-import"></i>}
              >
                Nhập Excel
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          {hasManageCustomerPermission && (
            <Button variant="primary" onClick={() => navigate("/customers/new")} leftIcon={<i className="fa-solid fa-user-plus"></i>}>
              Thêm mới
            </Button>
          )}
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
              selectedVoucherData.vouchers.map((v) => {
                const isExpired = new Date(v.expiredAt) < new Date() && v.status === 'UNUSED';
                return (
                  <div key={v.id} className={`relative border rounded-xl p-3 flex justify-between shadow-sm overflow-hidden ${
                    v.status === 'UNUSED' && !isExpired ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' : 'bg-gray-50 border-gray-200 grayscale-[0.5]'
                  }`}>
                    <div className="pl-2 space-y-0.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          v.status === 'UNUSED' && !isExpired ? 'text-red-700 bg-red-100' : 'text-gray-600 bg-gray-200'
                        }`}>
                          {v.voucherCode}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'USED' ? 'bg-gray-200 text-gray-600' :
                          isExpired ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {v.status === 'USED' ? 'Đã sử dụng' : isExpired ? 'Hết hạn' : 'Khả dụng'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-900 mt-1">{v.voucherName}</div>
                      <div className="flex justify-between items-end mt-1">
                        <div>
                          <div className={`text-sm font-black ${v.status === 'UNUSED' && !isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                            Giảm: {v.discountAmount.toLocaleString()}đ
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            HĐ từ {v.minOrderValue ? v.minOrderValue.toLocaleString() : "0"}đ
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium text-right flex flex-col gap-0.5 items-end">
                          <span>HSD: {new Date(v.expiredAt).toLocaleDateString('vi-VN')}</span>
                          {v.status === 'USED' && v.usedAt && (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-[9px] text-red-500 bg-red-50 px-1 rounded font-bold border border-red-100">
                                Đã dùng lúc: {new Date(v.usedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                              {v.usedOrderCode && (
                                <span className="text-[9px] text-gray-500 font-bold hover:text-blue-600 cursor-pointer">
                                  Mã ĐH: {v.usedOrderCode}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Modal>
      )}

      {/* Modal xác nhận Xóa / Kích hoạt lại */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác nhận thao tác"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant={confirmData?.currentStatus === "ACTIVE" ? "danger" : "primary"}
              onClick={confirmAction}
              leftIcon={
                <i
                  className={`fa-solid ${confirmData?.currentStatus === "ACTIVE"
                    ? "fa-trash"
                    : "fa-rotate-right"
                    }`}
                ></i>
              }
            >
              {confirmData?.action}
            </Button>
          </div>
        }
      >
        <div className="py-4 text-gray-700">
          Bạn có chắc chắn muốn <strong className="text-gray-900">{confirmData?.action?.toLowerCase()}</strong> khách hàng <strong className="text-gray-900">{confirmData?.name}</strong> không?
        </div>
      </Modal>
    </div>
  );
}
