import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCustomerGroupByIdQuery, useDeleteCustomerGroupMutation } from "@/redux/api/customerApi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import CustomerGroupEditModal from "./components/CustomerGroupEditModal";
import toast from "react-hot-toast";

export default function CustomerGroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [deleteCustomerGroup, { isLoading: isDeleting }] = useDeleteCustomerGroupMutation();

  // Gọi API lấy dữ liệu chi tiết nhóm
  const { data: responseData, isLoading } = useGetCustomerGroupByIdQuery(id as string, {
    skip: !id,
  });

  const group = responseData?.data;

  const handleDelete = async () => {
    try {
      await deleteCustomerGroup(id as string).unwrap();
      toast.success("Xóa hạng thẻ thành công!");
      setIsDeleteModalOpen(false);
      navigate("/customers/groups", { replace: true });
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi xóa hạng thẻ!");
    }
  };

  // Xử lý icon theo mã hạng
  const getGroupIcon = (code?: string) => {
    switch (code) {
      case "MEMBER":
        return <i className="fa-solid fa-user text-base"></i>;
      case "BRONZE":
        return <i className="fa-solid fa-award text-base"></i>;
      case "SILVER":
        return <i className="fa-solid fa-medal text-base"></i>;
      case "GOLD":
        return <i className="fa-solid fa-crown text-base"></i>;
      case "PLATINUM":
        return <i className="fa-solid fa-star text-base"></i>;
      case "RUBY":
        return <i className="fa-solid fa-gem text-base"></i>;
      case "DIAMOND":
        return <i className="fa-solid fa-gem text-base"></i>;
      case "BLACK":
        return <i className="fa-solid fa-gem text-base"></i>;
      default:
        return <i className="fa-solid fa-users text-base"></i>;
    }
  };

  const getGroupColorClass = (code?: string) => {
    switch (code) {
      case "MEMBER":
        return "bg-gray-100 text-gray-600";
      case "BRONZE":
        return "bg-orange-100 text-orange-600";
      case "SILVER":
        return "bg-slate-100 text-slate-600";
      case "GOLD":
        return "bg-amber-100 text-amber-600";
      case "PLATINUM":
        return "bg-teal-100 text-teal-600";
      case "RUBY":
        return "bg-rose-100 text-rose-600";
      case "DIAMOND":
        return "bg-blue-100 text-blue-400";
      case "BLACK":
        return "bg-gray-800 text-white";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex justify-center min-h-[500px] items-center">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-600"></i>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-gray-500 min-h-[500px]">
        <i className="fa-solid fa-layer-group text-4xl mb-4 text-gray-300"></i>
        <h2 className="text-xl font-bold">Không tìm thấy nhóm khách hàng!</h2>
        <Button variant="ghost" onClick={() => navigate("/customers/groups")} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div className="flex-1 w-full sm:w-auto text-center sm:text-left flex justify-center sm:justify-start">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <span
              className={`${getGroupColorClass(
                group.code
              )} w-9 h-9 rounded-lg flex items-center justify-center shadow-sm`}
            >
              {getGroupIcon(group.code)}
            </span>
            Nhóm: {group.name.replace(/\s*\([A-Za-z]+\)/g, '')}
          </h1>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            variant="outline"
            leftIcon={<i className="fa-solid fa-arrow-left"></i>}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <Button
            variant="primary"
            leftIcon={<i className="fa-solid fa-pen-to-square"></i>}
            onClick={() => setIsEditModalOpen(true)}
          >
            Sửa thông tin
          </Button>
          <Button
            variant="danger"
            leftIcon={<i className="fa-solid fa-trash"></i>}
            onClick={() => setIsDeleteModalOpen(true)}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            Xóa nhóm
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CỘT TRÁI: THÔNG TIN HỆ THỐNG */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-1.5">
              <i className="fa-solid fa-server text-gray-300"></i> Thông tin hệ thống
            </h3>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Hạng thẻ</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {group.code === 'BRONZE' ? 'Đồng' : group.code === 'SILVER' ? 'Bạc' : group.code === 'GOLD' ? 'Vàng' : group.code === 'MEMBER' ? 'Thành viên' : group.code}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3.5">
                <span className="text-gray-500">Voucher sinh nhật</span>
                {group.birthdayVoucherName ? (
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1 max-w-[55%] text-right truncate" title={group.birthdayVoucherName}>
                    <i className="fa-solid fa-gift text-[10px]"></i>
                    {group.birthdayVoucherName}
                  </span>
                ) : (
                  <span className="text-gray-400 italic font-medium">Chưa cài</span>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3.5">
                <span className="text-gray-500">Thời gian tạo</span>
                <span className="text-gray-700 text-xs">
                  {new Date(group.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* CARD TỔNG SỐ KHÁCH HÀNG */}
          <div
            onClick={() => navigate(`/customers/groups/${group.id}/members`)}
            className="group bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-5 text-white shadow-md shadow-slate-200/40 cursor-pointer transition-all hover:brightness-105 active:scale-[0.99] relative overflow-hidden"
            title="Xem danh sách thành viên thuộc nhóm này"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>

            <div className="flex items-center justify-between mb-1 relative z-10">
              <span className="text-slate-200 text-[10px] font-bold uppercase tracking-wider">
                Thành viên thuộc hạng
              </span>
              <i className="fa-solid fa-users text-slate-400/40 text-lg transition-transform group-hover:scale-110"></i>
            </div>
            <div className="text-3xl font-black relative z-10 flex items-baseline justify-between">
              <span>{group.totalCustomers}</span>
              <span className="text-xs text-slate-300 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Xem ngay
                <i className="fa-solid fa-circle-arrow-right text-[10px]"></i>
              </span>
            </div>
            <p className="text-slate-300/60 text-[10px] mt-1.5 italic relative z-10">
              * Bấm vào để lọc chi tiết danh sách khách hàng thuộc nhóm này
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: QUY TẮC & ĐẶC ĐIỂM */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-blue-500"></i> Quy tắc thăng hạng & Đặc điểm phân lớp
            </h3>
          </div>
          <div className="p-6 space-y-5 text-xs font-semibold">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
                  Chi tiêu tối thiểu
                </label>
                <div className="text-sm font-bold text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 ">
                  {(group.minSpending || 0).toLocaleString("vi-VN")} <span className="underline">₫</span>
                </div>
              </div>

            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
                Mô tả nhóm định mục
              </label>
              <div className="text-xs text-gray-700 leading-relaxed bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-100 font-medium">
                {group.description}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
                Ghi chú hệ thống
              </label>
              {group.note ? (
                <div className="text-xs text-amber-700 bg-amber-50/50 px-4 py-3.5 rounded-xl border border-amber-100 leading-relaxed font-medium flex items-center gap-2">
                  <i className="fa-solid fa-comment-dots text-amber-400 text-sm shrink-0"></i>
                  <span>{group.note}</span>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic bg-gray-50/50 px-4 py-3.5 rounded-xl border border-gray-100 border-dashed leading-relaxed font-medium flex items-center gap-2">
                  <i className="fa-solid fa-comment-slash text-gray-300 text-sm shrink-0"></i>
                  <span>Không có ghi chú hoặc cấu hình ưu đãi đặc biệt cho nhóm phân hạng này.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomerGroupEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        group={group}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <i className="fa-solid fa-triangle-exclamation"></i>
            Xác nhận xóa hạng thẻ
          </div>
        }
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Xóa hạng thẻ
            </Button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa hạng thẻ <strong className="text-red-600 font-bold">{group.name}</strong> không?
          </p>
          <div className="text-red-500 text-sm mt-3 flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
            <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
            <span>
              Lưu ý: Hành động này không thể hoàn tác. Dữ liệu xếp hạng của khách hàng thuộc hạng thẻ này sẽ bị ảnh hưởng.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
