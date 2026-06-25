import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCustomerByIdQuery, useGetCustomerOrdersQuery, useGetCustomerCareLogsQuery } from "@/redux/api/customerApi";
import type { CustomerOrderHistory } from "@/types/customer.types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State quản lý việc chuyển đổi giữa 2 tab (Đơn hàng và Chăm sóc)
  const [activeTab, setActiveTab] = useState<"orders" | "care">("orders");
  const [orderPage, setOrderPage] = useState(0); // State quản lý trang hiện tại

  // Gọi API lấy dữ liệu chi tiết
  const { data: responseData, isLoading, error } = useGetCustomerByIdQuery(
    Number(id),
    {
      skip: !id,
    },
  );

  // Lấy danh sách lịch sử đơn hàng
  const { data: ordersResponse, isLoading: isOrdersLoading, isFetching: isOrdersFetching } = useGetCustomerOrdersQuery(
    { id: id as string, page: orderPage, size: 5 },
    { skip: !id }
  );

  const orderHistory = ordersResponse?.data?.content || [];
  const orderPageData = ordersResponse?.data;

  // Lấy danh sách lịch sử chăm sóc
  const [carePage, setCarePage] = useState(0); // State quản lý trang hiện tại cho tab Chăm sóc
  const { data: careLogsResponse, isLoading: isCareLogsLoading, isFetching: isCareLogsFetching } = useGetCustomerCareLogsQuery(
    { id: id as string, page: carePage, size: 5 },
    { skip: !id }
  );

  const careLogs = careLogsResponse?.data?.content || [];
  const carePageData = careLogsResponse?.data;

  console.log("=== DEBUG TAB CHĂM SÓC ===");
  console.log("1. Mở tab chăm sóc?:", activeTab === "care");
  console.log("2. ID khách hàng đang xem:", id);
  console.log("3. isCareLogsFetching (Đang gọi API?):", isCareLogsFetching);
  console.log("4. Dữ liệu trả về (careLogs):", careLogs);
  console.log("5. Lỗi API (nếu có):", careLogsResponse ? "Thành công" : "Có thể bị lỗi hoặc chưa chạy");
  console.log("=========================");

  console.log("=== DEBUG PHÂN TRANG ===");
  console.log("1. orderPage (React State):", orderPage);
  console.log("2. isOrdersFetching (Đang gọi API?):", isOrdersFetching);
  console.log("3. API Trả về (orderPageData.number):", orderPageData?.number);
  console.log("========================");

  const customer = responseData?.data;

  // Hiệu ứng tải dữ liệu
  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-[500px]">
        <i className="fa-solid fa-spinner fa-spin text-blue-600 text-3xl"></i>
      </div>
    );
  }

  // Xử lý lỗi không tìm thấy
  if (!customer) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[500px] text-gray-500">
        <i className="fa-solid fa-user-xmark text-4xl mb-4 text-gray-300"></i>
        <h2 className="text-xl font-bold">Không tìm thấy khách hàng!</h2>
        <p className="mt-2 text-sm text-red-500">ID đang cố gắng lấy: <b>{id}</b></p>
        <Button
          variant="ghost"
          onClick={() => navigate("/customers")}
          className="mt-4"
          leftIcon={<i className="fa-solid fa-arrow-left"></i>}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Xử lý logic màu sắc Hạng thẻ
  const rankCode = customer.customerGroup?.code || "BRONZE";
  const rankVariant =
    rankCode === "GOLD"
      ? "warning"
      : rankCode === "SILVER"
        ? "default"
        : "info";

  return (
    <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
      {/* HEADER */}
      <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <button
              onClick={() => navigate("/customers/list")}
              className="hover:text-blue-600 transition"
            >
              Quản lý khách hàng
            </button>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <span className="text-gray-900 font-semibold">Hồ sơ chi tiết</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-user-check text-blue-600"></i> Hồ sơ khách
            hàng: {customer.fullName}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            leftIcon={<i className="fa-solid fa-arrow-left"></i>}
            onClick={() => {
              navigate(-1);
            }}
          >
            Quay lại
          </Button>
          <Button
            variant="outline"
            leftIcon={<i className="fa-solid fa-pen-to-square"></i>}
            onClick={() => {
              navigate(`/customers/edit/${id}`);
            }}
          >
            Sửa thông tin
          </Button>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN TỪ API */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-5 lg:col-span-1">
          <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md uppercase">
              {customer.fullName.substring(0, 2)}
            </div>
            <h2 className="font-bold text-gray-900 text-base">
              {customer.fullName}
            </h2>

          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Số điện thoại
              </label>
              <div className="font-mono text-sm font-bold text-gray-900">
                {customer.phone}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Ngày sinh / Giới tính
              </label>
              <div className="font-semibold text-gray-800 flex items-center gap-2 mt-1">
                {customer.dateOfBirth || "Chưa cập nhật"} —
                <Badge variant={customer.gender === "MALE" ? "info" : "danger"}>
                  {customer.gender}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Địa chỉ
              </label>
              <div className="font-medium text-gray-800 leading-relaxed">
                {customer.address || "Chưa cập nhật"}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Hạng thẻ
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={rankVariant as any}>{rankCode}</Badge>
                <span className="text-[11px] text-slate-600 font-bold tracking-wide">
                  · {customer.customerGroup?.name || "Khách thường"}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Trạng thái hệ thống
              </label>
              <div className="mt-1">
                <Badge
                  variant={customer.status === "ACTIVE" ? "success" : "danger"}
                >
                  {customer.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Ngày tạo hồ sơ
              </label>
              <div className="font-mono text-gray-700 font-semibold">
                {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>

            {customer.note && (
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Ghi chú (note)
                </label>
                <div className="bg-amber-50/60 border border-amber-100/80 rounded-xl p-3 text-amber-800 italic font-medium leading-relaxed shadow-sm">
                  "{customer.note}"
                </div>
              </div>
            )}

            {/* VOUCHER TỪ API */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                Kho Voucher của khách ({customer.vouchers?.length || 0})
              </label>

              {customer.vouchers?.map((voucher) => (
                <div
                  key={voucher.id}
                  className="relative bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/80 rounded-xl p-3 flex items-center justify-between shadow-sm overflow-hidden mb-2"
                >
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-red-200 rounded-full"></div>
                  <div className="pl-2 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                        {voucher.voucherCode}
                      </span>
                      <Badge
                        variant={
                          voucher.status === "UNUSED" ? "success" : "default"
                        }
                      >
                        {voucher.status}
                      </Badge>
                    </div>
                    <div className="text-[12px] font-bold text-gray-900">
                      {voucher.voucherName}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      HĐ từ {voucher.minOrderValue.toLocaleString()}đ
                    </div>
                  </div>
                  <div className="text-red-500/20 text-2xl pr-1">
                    <i className="fa-solid fa-ticket-simple"></i>
                  </div>
                </div>
              ))}

              {!customer.vouchers?.length && (
                <div className="text-center text-gray-400 italic text-[11px] py-4 bg-gray-50 rounded-lg border border-gray-100">
                  Không có voucher nào.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TABS LỊCH SỬ ĐƠN HÀNG VÀ CHĂM SÓC */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden lg:col-span-3">
          {/* THANH TABS BẰNG STATE CỦA REACT */}
          <div className="border-b border-gray-200 bg-gray-50/60 flex text-sm font-semibold">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3.5 border-b-2 transition-all flex items-center gap-2 ${activeTab === "orders"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
            >
              <i className="fa-solid fa-bag-shopping"></i> Lịch sử đơn hàng
              <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {orderPageData?.totalElements || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("care")}
              className={`px-6 py-3.5 border-b-2 transition-all flex items-center gap-2 ${activeTab === "care"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
            >
              <i className="fa-solid fa-heart-pulse"></i> Lịch sử chăm sóc
              (Timeline)
              <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                {carePageData?.totalElements || 0}
              </span>
            </button>
          </div>

          <div className="p-6">
            {/* CONTENT TAB: ĐƠN HÀNG CUSTOM GIAO DIỆN */}
            {activeTab === "orders" && (
              <div className="space-y-5 block">

                {(isOrdersLoading || isOrdersFetching) ? (
                  <div className="p-10 flex justify-center bg-white rounded-xl border border-gray-200">
                    <i className="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i>
                  </div>
                ) : orderHistory.length === 0 ? (
                  <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                    Khách hàng chưa có đơn hàng nào.
                  </div>
                ) : (
                  orderHistory.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {/* HEADER ĐƠN HÀNG */}
                      <div className="bg-slate-50/80 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-gray-900 text-sm">{order.orderNumber}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500 font-medium">
                            <i className="fa-regular fa-clock mr-1"></i>
                            {new Date(order.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={order.status === "COMPLETED" ? "success" : "warning"}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      {/* CHI TIẾT SẢN PHẨM */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50/40 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                              <th className="py-2.5 px-4">Sản phẩm</th>
                              <th className="py-2.5 px-4">Mã SKU</th>
                              <th className="py-2.5 px-4 text-center">SL</th>
                              <th className="py-2.5 px-4 text-right">Đơn giá</th>
                              <th className="py-2.5 px-4 text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                            {order.items?.map((item) => (
                              <tr key={item.id}>
                                <td className="py-3 px-4 font-bold text-gray-900">{item.productName}</td>
                                <td className="py-3 px-4 font-mono text-gray-500">{item.productSku}</td>
                                <td className="py-3 px-4 text-center font-bold text-gray-900">{item.quantity}</td>
                                <td className="py-3 px-4 text-right">{item.unitPrice.toLocaleString()}đ</td>
                                <td className="py-3 px-4 text-right font-bold text-gray-900">{item.subtotal.toLocaleString()}đ</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* FOOTER ĐƠN HÀNG */}
                      <div className="bg-gray-50/30 p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                        <div className="text-gray-500 space-y-1">
                          <div>
                            <span className="font-semibold text-gray-700">Tạo bởi:</span> {order.createdByUsername} (ID: {order.createdById})
                          </div>
                          {order.note && (
                            <div className="italic text-amber-700 bg-amber-50/60 border border-amber-100/50 p-2 rounded-lg mt-1">
                              <span className="font-semibold text-gray-600 not-italic">Ghi chú:</span> {order.note}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5 text-right max-w-xs ml-auto w-full">
                          <div className="flex justify-between text-gray-500">
                            <span>Tổng tiền (totalAmount):</span>
                            <span className="font-bold text-gray-900">{order.totalAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Khách đã trả (paidAmount):</span>
                            <span>{order.paidAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="flex justify-between text-gray-500 border-t border-gray-200/60 pt-1.5 font-bold">
                            <span>Tiền thừa (changeAmount):</span>
                            <span className="text-blue-600">{order.changeAmount.toLocaleString()}đ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* THANH PHÂN TRANG CUSTOM BẰNG COMPONENT CHUNG */}
                {!isOrdersLoading && orderPageData && orderPageData.totalElements > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                    <Pagination
                      currentPage={orderPageData.number}
                      totalPages={orderPageData.totalPages}
                      totalElements={orderPageData.totalElements}
                      pageSize={orderPageData.size}
                      onPageChange={(newPage) => {
                        console.log("User clicked page:", newPage);
                        setOrderPage(newPage);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* CONTENT TAB: CHĂM SÓC */}
            {activeTab === "care" && (
              <div className="space-y-5 block">
                {(isCareLogsLoading || isCareLogsFetching) ? (
                  <div className="p-10 flex justify-center bg-white rounded-xl border border-gray-200">
                    <i className="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i>
                  </div>
                ) : careLogs.length === 0 ? (
                  <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                    Khách hàng chưa có lịch sử chăm sóc nào.
                  </div>
                ) : (
                  <div className="relative border-l-[3px] border-slate-200 pl-6 ml-3 space-y-6">
                    {careLogs.map((log) => (
                      <div key={log.id} className="relative group">
                        <span className="absolute -left-[33px] top-1.5 bg-emerald-500 w-[18px] h-[18px] rounded-full border-[3px] border-white ring-4 ring-emerald-50 transition-all duration-300 group-hover:ring-emerald-100 group-hover:scale-110 z-10"></span>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs mb-3 gap-2">
                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                              <span className="bg-blue-50 text-blue-600 w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-3xs">
                                <i className="fa-solid fa-headset"></i>
                              </span>
                              <div>
                                <span className="text-gray-400 font-medium">
                                  Nhân viên thực hiện:
                                </span>{" "}
                                <span className="text-gray-900 font-bold hover:text-blue-600 transition-colors">
                                  {log.calledBy?.fullName || "Chưa rõ"}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-gray-600 text-[11px] bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60 flex items-center gap-1.5 self-start sm:self-auto">
                              <i className="fa-regular fa-clock text-gray-400 text-xs"></i>
                              {log.calledAt ? new Date(log.calledAt).toLocaleString("vi-VN") : "Chưa gọi"}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                            {log.campaign && (
                              <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-purple-100/80 uppercase tracking-wider flex items-center gap-1">
                                <i className="fa-solid fa-bullhorn text-[9px]"></i>{" "}
                                {log.campaign.name}
                              </span>
                            )}
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Trạng thái: {log.result}
                            </span>
                            {log.order && (
                              <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-lg border border-blue-200/60 font-mono font-medium">
                                <i className="fa-solid fa-link mr-0.5"></i> Có kèm đơn hàng
                              </span>
                            )}
                          </div>

                          <div className="text-[13px] text-gray-700 bg-gray-50/60 p-3.5 rounded-xl border border-gray-100 leading-relaxed relative overflow-hidden">
                            <i className="fa-solid fa-quote-left absolute -top-1 -left-1 text-gray-200/40 text-3xl font-black select-none"></i>
                            <div className="relative z-10 pl-5">
                              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                                Nội dung cuộc gọi (note)
                              </div>
                              <p className="font-medium text-gray-800">
                                "{log.note || "Không có nội dung ghi chú"}"
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                            <i className="fa-solid fa-server text-[9px]"></i>
                            <span>
                              Hệ thống ghi nhận (createdAt): {log.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* THANH PHÂN TRANG CHO TAB CHĂM SÓC */}
                {!isCareLogsLoading && carePageData && carePageData.totalElements > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                    <Pagination
                      currentPage={carePageData.number}
                      totalPages={carePageData.totalPages}
                      totalElements={carePageData.totalElements}
                      pageSize={carePageData.size}
                      onPageChange={(newPage) => setCarePage(newPage)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
