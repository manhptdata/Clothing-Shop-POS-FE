import React from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerCenterPage() {
  const navigate = useNavigate();

  return (
    // Phần div ngoài cùng (Bao bọc tất cả)
    <div className="w-full max-w-7xl mx-auto bg-transparent p-4 md:p-8">
      {/* --- PHẦN HEADER TIÊU ĐỀ --- */}
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
          Trung tâm Khách hàng
        </h2>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">
          Lựa chọn phân hệ chức năng CRM để xử lý nghiệp vụ bán hàng tại quầy
        </p>
      </div>

      {/* --- PHẦN DANH SÁCH CÁC THẺ (GRID CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: QUẢN LÝ KHÁCH HÀNG */}
        <div
          onClick={() => navigate("/customers/list")}
          className="group bg-white rounded-2xl border border-gray-200/70 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-[#0f5a3e] rounded-xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-105">
              <i className="fa-solid fa-address-book"></i>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                Quản lý Khách hàng
                <i className="fa-solid fa-arrow-right text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#0f5a3e]"></i>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Quản lý toàn diện hồ sơ cá nhân, lịch sử giao dịch và tích lũy chi tiêu. Nắm bắt nhanh chóng thông tin điểm thưởng và danh sách voucher của từng khách hàng.
              </p>
            </div>
          </div>

        </div>

        {/* CARD 2: NHÓM KHÁCH HÀNG */}
        <div
          onClick={() => navigate("/customers/groups")}
          className="group bg-white rounded-2xl border border-gray-200/70 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-105">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                Nhóm khách hàng
                <i className="fa-solid fa-arrow-right text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-600"></i>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Thiết lập hệ thống phân hạng thẻ (Đồng, Bạc, Vàng...) hoàn toàn tự động theo mức chi tiêu. Dễ dàng phân nhóm khách hàng mục tiêu để xây dựng các chương trình ưu đãi riêng biệt.
              </p>
            </div>
          </div>

        </div>

        {/* CARD 3: CHĂM SÓC KHÁCH HÀNG */}
        <div
          onClick={() => navigate("/customers/care")}
          className="group bg-white rounded-2xl border border-gray-200/70 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-105">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                Chăm sóc Khách hàng
                <i className="fa-solid fa-arrow-right text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-purple-600"></i>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Tổ chức và theo dõi các chiến dịch tương tác với khách hàng (gọi điện hỏi thăm, chúc mừng sinh nhật, thông báo ưu đãi...). Lưu trữ chi tiết lịch sử chăm sóc trên từng hồ sơ.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
