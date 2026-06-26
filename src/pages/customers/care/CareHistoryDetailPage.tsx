import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useGetCustomerCareLogsQuery } from "@/redux/api/customerApi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

export default function CareHistoryDetailPage() {
  const { id } = useParams<{ id: string }>(); // Đây là Customer ID
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  // Gọi API lấy danh sách care logs của khách hàng
  const { data: responseData, isLoading } = useGetCustomerCareLogsQuery({
    id: id || "",
    page: page,
    size: 1, // 1 bản ghi 1 trang theo yêu cầu
  });

  const logs = responseData?.data?.content || [];
  const latestLog = logs[0];
  const totalPages = responseData?.data?.totalPages || 0;
  const totalElements = responseData?.data?.totalElements || 0;

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  if (logs.length === 0 || !latestLog) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Không tìm thấy lịch sử chăm sóc nào cho khách hàng này.</p>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full text-gray-800 antialiased">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <span
              className="hover:text-blue-600 transition cursor-pointer"
              onClick={() => navigate(-1)}
            >
              Nhật ký chăm sóc
            </span>
            <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
            <span className="text-gray-900 font-semibold">
              Lịch sử chăm sóc
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Lịch sử chăm sóc khách hàng
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<i className="fa-solid fa-arrow-left"></i>}
        >
          Quay lại
        </Button>
      </header>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Cột trái (Nội dung log) */}
        <div className="md:col-span-2 space-y-8">
          {logs.map((log) => (
            <div key={log.id} className="relative">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 text-xs font-semibold">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-comment-text text-blue-500"></i> Nội dung ghi nhận cuộc gọi
                  </h3>
                  <Badge variant="warning">
                    {log.result || "CHƯA RÕ"}
                  </Badge>
                </div>

                <div>
                  <label className="block text-gray-400 uppercase tracking-wider text-[10px] mb-1">
                    Chi tiết trao đổi (note)
                  </label>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-gray-800 text-sm font-medium leading-relaxed whitespace-normal italic">
                    "{log.note || "Không có ghi chú"}"
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">
                      Thời gian gọi thực tế (calledAt)
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-700 font-mono">
                      <i className="fa-solid fa-phone-volume text-gray-400 text-[11px]"></i>
                      <span>
                        {log.calledAt
                          ? new Date(log.calledAt).toLocaleString("vi-VN")
                          : "--"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">
                      Hệ thống tạo lúc (createdAt)
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-mono font-normal">
                      <i className="fa-solid fa-clock text-gray-400 text-[11px]"></i>
                      <span>
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("vi-VN")
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>

                {log.nextRetryAt && (
                  <div className="bg-amber-50/40 border border-amber-100/70 rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">
                      <i className="fa-solid fa-bell"></i>
                    </div>
                    <div>
                      <span className="block text-amber-800 uppercase tracking-wider text-[9px] font-bold">
                        Lịch hẹn gọi lại lần sau (nextRetryAt)
                      </span>
                      <span className="text-sm font-mono font-bold text-amber-900">
                        {new Date(log.nextRetryAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 grid gap-6 text-xs font-semibold mt-4 ${log.order ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-sm shrink-0">
                    <i className="fa-solid fa-bullhorn"></i>
                  </div>
                  <div>
                    <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">
                      Chiến dịch (campaign)
                    </span>
                    {log.campaign ? (
                      <span className="block font-bold text-gray-900 text-sm">
                        {log.campaign.name}
                      </span>
                    ) : (
                      <span className="block font-bold text-gray-500 text-sm italic">
                        Không thuộc chiến dịch
                      </span>
                    )}
                  </div>
                </div>

                {log.order && (
                  <div className="flex items-start gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-sm shrink-0">
                      <i className="fa-solid fa-receipt"></i>
                    </div>
                    <div>
                      <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">
                        Đơn hàng liên quan
                      </span>
                      <span className="block font-bold text-emerald-700 text-sm hover:underline cursor-pointer">
                        {log.order.orderNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Điều hướng Phân trang chung của dự án */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mt-4 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalElements={totalElements}
                pageSize={1}
              />
            </div>
          )}
        </div>

        {/* Cột phải (Thông tin User/Customer) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-xs font-semibold text-center">
            <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-3 text-left border-b border-gray-100 pb-2">
              Đối tượng khách hàng
            </span>
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2 shadow-inner">
              <i className="fa-solid fa-user"></i>
            </div>
            <h4 className="text-sm font-bold text-gray-900">
              {latestLog.customer.fullName}
            </h4>
            <p className="text-gray-600 font-mono mt-0.5">
              <i className="fa-solid fa-phone text-[10px] text-gray-400"></i>{" "}
              {latestLog.customer.phone}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-xs font-semibold text-center">
            <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-3 text-left border-b border-gray-100 pb-2">
              Nhân viên thực hiện
            </span>
            <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2 shadow-inner">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {latestLog.calledBy.fullName}
            </h4>
            <p className="text-blue-600 font-mono mt-0.5">
              @{latestLog.calledBy.username}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 whitespace-nowrap"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
            <Link to={`/customers/care/history/log/${latestLog.id}/edit`} className="flex-1 block">
              <Button 
                type="button"
                size="sm"
                variant="primary" 
                className="w-full whitespace-nowrap !bg-amber-500 hover:!bg-amber-600 !border-amber-500" 
                leftIcon={<i className="fa-solid fa-pen-to-square"></i>}
              >
                Sửa nhật ký
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
