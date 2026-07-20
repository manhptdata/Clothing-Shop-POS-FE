import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetCustomerByIdQuery,
  useGetCustomerOrdersQuery,
  useGetCustomerCareLogsQuery,
  useGetCustomerPointHistoryQuery,
  useRevokeCustomerVoucherMutation,
  useGiveCustomerVoucherMutation,
  useGetVoucherOptionsQuery
} from "@/redux/api/customerApi";
import type { CustomerOrderHistory, CustomerWithEmail } from "@/types/customer.types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { useAppSelector } from "@/redux/hooks";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userPerms = user?.permissions || [];
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const hasManageCustomerPermission = isAdmin || userPerms.includes('MANAGE_CUSTOMER');

  // State quản lý việc chuyển đổi giữa 2 tab (Đơn hàng và Chăm sóc)
  const [activeTab, setActiveTab] = useState<"orders" | "care" | "points">("orders");
  const [orderPage, setOrderPage] = useState(0); // State quản lý trang hiện tại
  const [orderSize, setOrderSize] = useState(5); // State quản lý số dòng mỗi trang
  const [orderKeyword, setOrderKeyword] = useState("");

  // Gọi API lấy dữ liệu chi tiết
  const { data: responseData, isLoading, error } = useGetCustomerByIdQuery(
    Number(id),
    {
      skip: !id,
    },
  );

  // Lấy danh sách lịch sử đơn hàng
  const { data: ordersResponse, isLoading: isOrdersLoading, isFetching: isOrdersFetching } = useGetCustomerOrdersQuery(
    { id: id as string, page: orderPage, size: orderSize, keyword: orderKeyword || undefined },
    { skip: !id }
  );

  const orderHistory = ordersResponse?.data?.content || [];
  const orderPageData = ordersResponse?.data;

  // Lấy danh sách lịch sử chăm sóc
  const [carePage, setCarePage] = useState(0); // State quản lý trang hiện tại cho tab Chăm sóc
  const [careSize, setCareSize] = useState(5); // State quản lý số dòng
  const { data: careLogsResponse, isLoading: isCareLogsLoading, isFetching: isCareLogsFetching } = useGetCustomerCareLogsQuery(
    { id: id as string, page: carePage, size: careSize },
    { skip: !id }
  );

  const careLogs = careLogsResponse?.data?.content || [];
  const carePageData = careLogsResponse?.data;

  // Lấy danh sách lịch sử điểm thưởng
  const [pointPage, setPointPage] = useState(0);
  const [pointSize, setPointSize] = useState(5);
  const { data: pointLogsResponse, isLoading: isPointLogsLoading, isFetching: isPointLogsFetching } = useGetCustomerPointHistoryQuery(
    { id: Number(id), page: pointPage, size: pointSize },
    { skip: !id }
  );
  
  const pointLogs = pointLogsResponse?.data?.content || [];
  const pointPageData = pointLogsResponse?.data;

  // Quản lý Ví Voucher thủ công
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);

  const [revokeCustomerVoucher, { isLoading: isRevoking }] = useRevokeCustomerVoucherMutation();
  const [giveCustomerVoucher, { isLoading: isGiving }] = useGiveCustomerVoucherMutation();

  const { data: voucherOptionsData } = useGetVoucherOptionsQuery(
    { status: "ACTIVE" },
    { skip: !isGiveModalOpen }
  );

  const activeVouchersList = voucherOptionsData?.data || [];

  const handleRevokeVoucher = async (customerVoucherId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn thu hồi voucher này khỏi ví của khách hàng không?")) {
      return;
    }
    try {
      await revokeCustomerVoucher({ customerVoucherId, customerId: Number(id) }).unwrap();
      toast.success("Đã thu hồi voucher khỏi ví khách thành công!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Lỗi khi thu hồi voucher!");
    }
  };

  const handleGiveVoucher = async () => {
    if (!selectedVoucherId || !id) return;
    try {
      await giveCustomerVoucher({ customerId: Number(id), voucherId: selectedVoucherId }).unwrap();
      toast.success("Đã tặng voucher thành công vào ví khách hàng!");
      setIsGiveModalOpen(false);
      setSelectedVoucherId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Lỗi khi tặng voucher!");
    }
  };

  const customer = responseData?.data as CustomerWithEmail;

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
  const rankCode = customer.customerGroup?.code;
  const rankVariant =
    rankCode === "GOLD"
      ? "warning"
      : rankCode === "SILVER"
        ? "default"
        : rankCode === "MEMBER"
          ? "secondary"
          : "info";

  return (
    <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
      {/* HEADER */}
      <header className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <i className="fa-solid fa-user-check text-blue-600"></i> Hồ sơ khách
            hàng: {customer.fullName}
          </h1>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            leftIcon={<i className="fa-solid fa-arrow-left"></i>}
            onClick={() => {
              navigate(-1);
            }}
          >
            Quay lại
          </Button>
          {hasManageCustomerPermission && (
            <Button
              variant="outline"
              leftIcon={<i className="fa-solid fa-pen-to-square"></i>}
              onClick={() => {
                navigate(`/customers/edit/${id}`);
              }}
            >
              Sửa thông tin
            </Button>
          )}
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
              <div className="text-sm font-bold text-gray-900">
                {customer.phone}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Email
              </label>
              <div className="text-gray-800 font-semibold text-[15px] mt-1 tracking-tight flex items-center gap-2">
                {customer.email || "Chưa cập nhật"}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Ngày sinh / Giới tính
              </label>
              <div className="font-semibold text-gray-800 flex items-center gap-2 mt-1">
                {customer.dateOfBirth || "Chưa cập nhật"} —
                <Badge variant={customer.gender === "MALE" ? "info" : "danger"}>
                  {customer.gender === 'MALE' ? 'Nam' : customer.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
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
                {!rankCode ? (
                  <span className="text-gray-400 text-[11px] font-medium whitespace-nowrap">Chưa xếp hạng</span>
                ) : (
                  <div 
                    onClick={() => {
                      if (customer.customerGroup?.id) {
                        navigate(`/customers/groups/${customer.customerGroup.id}`);
                      }
                    }}
                    className="cursor-pointer hover:opacity-80 transition-opacity inline-block"
                    title="Xem chi tiết cấu hình hạng thẻ"
                  >
                    <Badge variant={rankVariant as any}>{rankCode === 'BRONZE' ? 'Đồng' : rankCode === 'SILVER' ? 'Bạc' : rankCode === 'GOLD' ? 'Vàng' : rankCode === 'MEMBER' ? 'Thành viên' : rankCode}</Badge>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Tổng chi tiêu
              </label>
              <div className="text-gray-900 font-bold text-[15px] mt-1">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(customer.totalSpent || 0)}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                Ngày tạo hồ sơ
              </label>
              <div className="text-gray-700 font-semibold">
                {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>

            {customer.note && (
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Ghi chú
                </label>
                <div className="bg-amber-50/60 border border-amber-100/80 rounded-xl p-3 text-amber-800 italic font-medium leading-relaxed shadow-sm break-words whitespace-pre-wrap">
                  "{customer.note}"
                </div>
              </div>
            )}

            {/* VOUCHER TỪ API */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  Kho Voucher của khách ({customer.vouchers?.length || 0})
                </label>
                {hasManageCustomerPermission && (
                  <button
                    onClick={() => setIsGiveModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition flex items-center gap-1 border border-blue-200"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i> Tặng Voucher
                  </button>
                )}
              </div>

              {customer.vouchers?.map((voucher) => {
                const isExpired = new Date(voucher.expiredAt) < new Date() && voucher.status === 'UNUSED';
                return (
                  <div
                    key={voucher.id}
                    className={`relative border rounded-xl p-3 flex items-center justify-between shadow-sm overflow-hidden mb-2 ${
                      voucher.status === 'UNUSED' && !isExpired ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' : 'bg-gray-50 border-gray-200 grayscale-[0.5]'
                    }`}
                  >
                    <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-4 bg-white border rounded-full ${
                      voucher.status === 'UNUSED' && !isExpired ? 'border-red-200' : 'border-gray-200'
                    }`}></div>
                    <div className="pl-2 space-y-0.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          voucher.status === 'UNUSED' && !isExpired ? 'text-red-700 bg-red-100' : 'text-gray-600 bg-gray-200'
                        }`}>
                          {voucher.voucherCode}
                        </span>
                        <Badge
                          variant={
                            voucher.status === 'USED' ? 'secondary' :
                            voucher.status === 'RESERVED' ? 'warning' :
                            isExpired ? 'danger' :
                            'success'
                          }
                        >
                          {voucher.status === 'USED' ? 'Đã sử dụng' :
                           voucher.status === 'RESERVED' ? 'Đang giữ chỗ' :
                           isExpired ? 'Hết hạn' : 'Khả dụng'}
                        </Badge>
                      </div>
                      <div className="text-[12px] font-bold text-gray-900">
                        {voucher.voucherName}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className={`text-sm font-black ${voucher.status === 'UNUSED' && !isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                            Giảm: {voucher.discountAmount.toLocaleString()}đ
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            HĐ từ {voucher.minOrderValue ? voucher.minOrderValue.toLocaleString() : "0"}đ
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium text-right flex flex-col gap-1 items-end">
                          <span>HSD: {new Date(voucher.expiredAt).toLocaleDateString('vi-VN')}</span>
                          {hasManageCustomerPermission && voucher.status === 'UNUSED' && (
                            <button
                              onClick={() => handleRevokeVoucher(voucher.id)}
                              disabled={isRevoking}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded transition border border-rose-200 flex items-center gap-1"
                              title="Thu hồi voucher này khỏi ví khách"
                            >
                              <i className="fa-solid fa-trash-can text-[9px]"></i> Thu hồi
                            </button>
                          )}
                          {voucher.status === 'USED' && voucher.usedAt && (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-[9px] text-red-500 bg-red-50 px-1 rounded font-bold border border-red-100">
                                Đã dùng: {new Date(voucher.usedAt).toLocaleDateString('vi-VN')}
                              </span>
                              {voucher.usedOrderCode && (
                                <span className="text-[9px] text-gray-500 font-bold hover:text-blue-600 cursor-pointer">
                                  Mã ĐH: {voucher.usedOrderCode}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

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
          <div className="border-b border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row text-sm font-semibold">
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
            <button
              onClick={() => setActiveTab("points")}
              className={`px-6 py-3.5 border-b-2 transition-all flex items-center gap-2 ${activeTab === "points"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
            >
              <i className="fa-solid fa-star"></i> Điểm thưởng
              <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                {pointPageData?.totalElements || 0}
              </span>
            </button>
          </div>

          <div className="p-6">
            {/* CONTENT TAB: ĐƠN HÀNG CUSTOM GIAO DIỆN */}
            {activeTab === "orders" && (
              <div className="space-y-5 block">
                <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-lg border border-gray-100 mb-2">
                  <div className="w-full max-w-sm">
                    <Input
                      placeholder="Tìm theo mã đơn hàng, ghi chú..."
                      value={orderKeyword}
                      onChange={(e) => {
                        setOrderKeyword(e.target.value);
                        setOrderPage(0);
                      }}
                      leftIcon={<i className="fa-solid fa-magnifying-glass text-gray-400"></i>}
                      className="bg-white"
                    />
                  </div>
                </div>

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
                          <span className="font-bold text-gray-900 text-sm">{order.orderNumber}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500 font-medium">
                            <i className="fa-regular fa-clock mr-1"></i>
                            {new Date(order.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={order.status === "COMPLETED" ? "success" : "warning"}>
                            {order.status === 'COMPLETED' ? 'Hoàn thành' : order.status === 'PENDING' ? 'Chờ xử lý' : 'Đã hủy'}
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
                                <td className="py-3 px-4 text-gray-500">{item.productSku}</td>
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
                            <span>Tổng tiền:</span>
                            <span className="font-bold text-gray-900">{order.totalAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Khách đã trả:</span>
                            <span>{order.paidAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="flex justify-between text-gray-500 border-t border-gray-200/60 pt-1.5 font-bold">
                            <span>Tiền thừa:</span>
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
                      currentPage={orderPage}
                      totalPages={orderPageData.totalPages}
                      totalElements={orderPageData.totalElements}
                      pageSize={orderPageData.size || orderSize}
                      onPageChange={(newPage) => {
                        setOrderPage(newPage);
                      }}
                      onSizeChange={(newSize) => {
                        setOrderSize(newSize);
                        setOrderPage(0);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* CONTENT TAB: LỊCH SỬ CHĂM SÓC */}
            {activeTab === "care" && (
              <div className="space-y-4">
                {(isCareLogsLoading || isCareLogsFetching) ? (
                  <div className="p-10 flex justify-center bg-white rounded-xl border border-gray-200">
                    <i className="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i>
                  </div>
                ) : careLogs.length === 0 ? (
                  <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <i className="fa-solid fa-headset text-gray-400 text-xl"></i>
                    </div>
                    Khách hàng chưa có lịch sử chăm sóc nào.
                  </div>
                ) : (
                  <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {careLogs.map((log) => (
                      <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-transform group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-100">
                          <i className="fa-solid fa-phone-volume text-sm"></i>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group-hover:border-blue-200">
                          <div className="hidden md:block absolute top-5 -left-3 group-odd:left-auto group-odd:-right-3 w-3 h-3 bg-white border-t border-r border-gray-100 group-hover:border-blue-200 transform -rotate-135 group-odd:rotate-45 transition-colors"></div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 border-b border-gray-50 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase overflow-hidden shadow-sm">
                                {log.calledBy?.fullName?.substring(0, 2) || "AD"}
                              </div>
                              <div>
                                <span className="text-gray-400 font-medium">
                                  Nhân viên thực hiện:
                                </span>{" "}
                                <span className="text-gray-900 font-bold hover:text-blue-600 transition-colors">
                                  {log.calledBy?.fullName || "Chưa rõ"}
                                </span>
                              </div>
                            </div>
                            <span className="text-gray-600 text-[11px] bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60 flex items-center gap-1.5 self-start sm:self-auto">
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
                            
                            {log.potentialStatus === "TIEM_NANG" && (
                              <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-green-200 uppercase tracking-wider flex items-center gap-1">
                                <i className="fa-solid fa-star text-[9px]"></i> Tiềm năng
                              </span>
                            )}
                            {log.potentialStatus === "KHONG_TIEM_NANG" && (
                              <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-red-200 uppercase tracking-wider flex items-center gap-1">
                                <i className="fa-solid fa-thumbs-down text-[9px]"></i> Không tiềm năng
                              </span>
                            )}
                            {log.potentialStatus === "MONG_LUNG" && (
                              <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-200 uppercase tracking-wider flex items-center gap-1">
                                <i className="fa-solid fa-face-thinking text-[9px]"></i> Mông lung
                              </span>
                            )}
                            {log.potentialStatus === "KHONG_XAC_DINH" && (
                              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 uppercase tracking-wider flex items-center gap-1">
                                <i className="fa-solid fa-question text-[9px]"></i> Không xác định
                              </span>
                            )}
                            {log.order && (
                              <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-lg border border-blue-200/60 font-medium">
                                <i className="fa-solid fa-link mr-0.5"></i> Có kèm đơn hàng
                              </span>
                            )}
                          </div>

                          <div className="text-[13px] text-gray-700 bg-gray-50/60 p-3.5 rounded-xl border border-gray-100 leading-relaxed relative overflow-hidden">
                            <i className="fa-solid fa-quote-left absolute -top-1 -left-1 text-gray-200/40 text-3xl font-black select-none"></i>
                            <div className="relative z-10 pl-5">
                              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                                Nội dung cuộc gọi
                              </div>
                              <p className="font-medium text-gray-800">
                                "{log.note || "Không có nội dung ghi chú"}"
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider">
                            <i className="fa-solid fa-server text-[9px]"></i>
                            <span>
                              Hệ thống ghi nhận: {log.createdAt}
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
                      currentPage={carePage}
                      totalPages={carePageData.totalPages}
                      totalElements={carePageData.totalElements}
                      pageSize={carePageData.size || careSize}
                      onPageChange={(newPage) => setCarePage(newPage)}
                      onSizeChange={(newSize) => {
                        setCareSize(newSize);
                        setCarePage(0);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* CONTENT TAB: LỊCH SỬ ĐIỂM THƯỞNG */}
            {activeTab === "points" && (
              <div className="space-y-4">
                {(isPointLogsLoading || isPointLogsFetching) ? (
                  <div className="p-10 flex justify-center bg-white rounded-xl border border-gray-200">
                    <i className="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i>
                  </div>
                ) : pointLogs.length === 0 ? (
                  <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <i className="fa-solid fa-star text-gray-400 text-xl"></i>
                    </div>
                    Khách hàng chưa có lịch sử điểm thưởng nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                          <th className="px-4 py-3 font-semibold w-1/4">Thời gian</th>
                          <th className="px-4 py-3 font-semibold w-1/6">Loại</th>
                          <th className="px-4 py-3 font-semibold w-1/6 text-right">Số điểm</th>
                          <th className="px-4 py-3 font-semibold">Diễn giải</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pointLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString("vi-VN")}
                            </td>
                            <td className="px-4 py-3">
                              {log.type === 'EARN' ? (
                                <Badge variant="success">Tích điểm</Badge>
                              ) : log.type === 'REDEEM' ? (
                                <Badge variant="warning">Tiêu điểm</Badge>
                              ) : (
                                <Badge variant="secondary">Hoàn điểm</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-bold ${log.pointsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {log.pointsChange > 0 ? `+${log.pointsChange}` : log.pointsChange}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {log.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {pointPageData && pointPageData.totalPages > 1 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                    <Pagination
                      currentPage={pointPage}
                      totalPages={pointPageData.totalPages}
                      totalElements={pointPageData.totalElements}
                      pageSize={pointPageData.size || pointSize}
                      onPageChange={(newPage) => setPointPage(newPage)}
                      onSizeChange={(newSize) => {
                        setPointSize(newSize);
                        setPointPage(0);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL TẶNG VOUCHER */}
      {isGiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <i className="fa-solid fa-gift text-rose-500"></i> Tặng Voucher cho khách hàng
              </h3>
              <button onClick={() => setIsGiveModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Chọn chương trình Voucher muốn tặng
              </label>
              <select
                className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                value={selectedVoucherId || ''}
                onChange={(e) => setSelectedVoucherId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- Chọn voucher từ danh sách --</option>
                {activeVouchersList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code} - {v.name} (Giảm {v.discountAmount?.toLocaleString()}đ)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsGiveModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleGiveVoucher}
                isLoading={isGiving}
                disabled={!selectedVoucherId || isGiving}
              >
                Xác nhận tặng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
