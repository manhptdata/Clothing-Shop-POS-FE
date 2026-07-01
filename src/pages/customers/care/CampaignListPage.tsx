import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPendingCustomersByCampaignQuery } from "@/redux/api/customerApi";
import type { CampaignType, Customer, CustomerWithEmail } from "@/types/customer.types";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { scriptAfter7Days, scriptAfter30Days, scriptRecallSchedule, scriptHappyBirthday } from "./CampaignScripts";

export default function CampaignListPage() {
  const navigate = useNavigate();
  const [currentCampaignType, setCurrentCampaignType] =
    useState<CampaignType>(() => (sessionStorage.getItem("selectedCampaignType") as CampaignType) || "AFTER_7_DAYS");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedScript, setSelectedScript] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    sessionStorage.setItem("selectedCampaignType", currentCampaignType);
  }, [currentCampaignType]);

  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useGetPendingCustomersByCampaignQuery({
    type: currentCampaignType,
    page,
    size,
  });

  const customers = responseData?.data?.content || [];
  const totalElements = responseData?.data?.totalElements || 0;
  const totalPages = responseData?.data?.totalPages || 0;

  // Lọc dữ liệu client-side tĩnh tạm thời theo SĐT hoặc Tên
  const filteredCustomers = customers.filter((c) => {
    const keywordLower = searchKeyword.toLowerCase();
    const matchPhone = c.phone?.includes(keywordLower) ?? false;
    const matchName = c.fullName?.toLowerCase().includes(keywordLower) ?? false;
    return !keywordLower || matchPhone || matchName;
  });

  const tableData = filteredCustomers.map((cust, index) => ({
    ...cust,
    stt: page * size + index + 1,
  }));

  const handleTabChange = (type: CampaignType) => {
    setCurrentCampaignType(type);
    setPage(0);
    setSearchInput("");
    setSearchKeyword("");
  };

  const getRankBadge = (code?: string) => {
    if (!code) {
      return <span className="text-gray-400 text-[11px] font-medium whitespace-nowrap">Chưa xếp hạng</span>;
    }

    const variant = code === "GOLD" ? "warning" : code === "SILVER" ? "default" : "info";
    return (
      <Badge variant={variant as any}>
        {code === 'BRONZE' ? 'Đồng' : code === 'SILVER' ? 'Bạc' : code === 'GOLD' ? 'Vàng' : code}
      </Badge>
    );
  };

  const columns: Column<Customer>[] = [
    {
      key: "stt",
      header: <span className="text-center w-full block">STT</span>,
      className: "text-center text-gray-400 text-[11px]",
      render: (cust) => (cust as any).stt,
    },
    {
      key: "fullName",
      header: "Khách hàng",
      render: (cust) => (
        <span 
          className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors inline-block"
          onClick={() => navigate(`/customers/${cust.id}`)}
        >
          {cust.fullName}
        </span>
      ),
    },
    {
      key: "phone",
      header: "SĐT",
      className: "text-gray-900 font-semibold text-blue-600",
      render: (cust) => cust.phone,
    },
    {
      key: "rank",
      header: "Hạng",
      render: (cust) => getRankBadge(cust.customerGroup?.code),
    },
    {
      key: "totalSpent",
      header: "Tổng chi tiêu",
      className: "text-gray-900 font-bold",
      render: (cust) => (
        <span>{((cust as any).totalSpent || 0).toLocaleString("vi-VN")} <span className="underline">₫</span></span>
      ),
    },
    {
      key: "points",
      header: "Điểm tích lũy",
      render: (cust) => (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-800">
          <i className="fa-solid fa-star text-yellow-400"></i> {cust.rewardPoints?.toLocaleString() || 0}
        </span>
      )
    },
    {
      key: "note",
      header: "Ghi chú",
      className: "text-amber-600 italic max-w-[120px] truncate",
      render: (cust) => <span title={cust.note}>{cust.note || "--"}</span>,
    },
    {
      key: "actions",
      header: <span className="text-center w-full block">Hành động</span>,
      className: "text-center",
      render: (cust) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/customers/care/history/${cust.id}`); }}
            className="p-1.5 bg-gray-50 text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-lg transition-all active:scale-90 shadow-sm"
            title="Xem toàn bộ lịch sử chăm sóc của khách này"
          >
            <i className="fa-solid fa-clock-rotate-left text-sm"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              let implicitCampaignId = undefined;
              if (currentCampaignType === "AFTER_7_DAYS") implicitCampaignId = 1;
              else if (currentCampaignType === "LONG_TIME_NO_BUY") implicitCampaignId = 2;
              else if (currentCampaignType === "RECALL_SCHEDULE") implicitCampaignId = 3;
              else if (currentCampaignType === "HAPPY_BIRTHDAY") implicitCampaignId = 4;

              navigate(`/customers/care/create/${cust.id}`, {
                state: {
                  customerName: cust.fullName,
                  customerPhone: cust.phone,
                  campaignId: implicitCampaignId
                }
              });
            }}
            className="p-1.5 bg-gray-50 text-gray-500 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 rounded-lg transition-all active:scale-90 shadow-sm"
            title="Tạo mới lịch sử chăm sóc"
          >
            <i className="fa-solid fa-phone-volume text-sm"></i> Tạo nhật ký
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div>

          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-headset text-blue-600"></i> Chăm sóc khách hàng
          </h1>
        </div>
        <Button
          variant="outline"
          leftIcon={<i className="fa-solid fa-clock-rotate-left"></i>}
          onClick={() => navigate("/customers/care/history")}
        >
          Xem toàn bộ lịch sử chăm sóc
        </Button>
      </header>

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => handleTabChange("AFTER_7_DAYS")}
          className={`p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-2 text-left transition-all border-l-4 ${currentCampaignType === "AFTER_7_DAYS"
            ? "border-l-blue-600 text-blue-600 bg-gray-50"
            : "border-l-transparent text-gray-500 hover:bg-gray-50"
            }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center text-lg ${currentCampaignType === "AFTER_7_DAYS" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
            >
              <i className="fa-solid fa-calendar-week"></i>
            </div>
            <div>
              <span
                className={`block font-bold text-sm mt-0.5 ${currentCampaignType === "AFTER_7_DAYS" ? "text-blue-600" : "text-gray-900"}`}
              >
                Sau mua 7 ngày
              </span>
              <span className="block text-[11px] text-gray-500 font-medium mt-1">
                Chăm sóc khách hàng sau 7 ngày mua sản phẩm
              </span>
            </div>
          </div>

        </button>

        <button
          onClick={() => handleTabChange("LONG_TIME_NO_BUY")}
          className={`p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-2 text-left transition-all border-l-4 ${currentCampaignType === "LONG_TIME_NO_BUY"
            ? "border-l-amber-500 text-amber-600 bg-gray-50"
            : "border-l-transparent text-gray-500 hover:bg-gray-50"
            }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center text-lg ${currentCampaignType === "LONG_TIME_NO_BUY" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}
            >
              <i className="fa-solid fa-hourglass-end"></i>
            </div>
            <div>
              <span
                className={`block font-bold text-sm mt-0.5 ${currentCampaignType === "LONG_TIME_NO_BUY" ? "text-amber-600" : "text-gray-900"}`}
              >
                Quá 30 ngày chưa mua
              </span>
              <span className="block text-[11px] text-gray-500 font-medium mt-1">
                Chăm sóc khách hàng sau 30 ngày chưa phát sinh đơn hàng mới
              </span>
            </div>
          </div>

        </button>

        <button
          onClick={() => handleTabChange("RECALL_SCHEDULE")}
          className={`p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-2 text-left transition-all border-l-4 ${currentCampaignType === "RECALL_SCHEDULE"
            ? "border-l-rose-500 text-rose-600 bg-gray-50"
            : "border-l-transparent text-gray-500 hover:bg-gray-50"
            }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center text-lg ${currentCampaignType === "RECALL_SCHEDULE" ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-500"}`}
            >
              <i className="fa-solid fa-phone-volume"></i>
            </div>
            <div>
              <span
                className={`block font-bold text-sm mt-0.5 ${currentCampaignType === "RECALL_SCHEDULE" ? "text-rose-600" : "text-gray-900"}`}
              >
                Hẹn gọi lại hôm nay
              </span>
              <span className="block text-[11px] text-gray-500 font-medium mt-1">
                Khách hàng hẹn gọi lại
              </span>
            </div>
          </div>

        </button>

        <button
          onClick={() => handleTabChange("HAPPY_BIRTHDAY")}
          className={`p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-2 text-left transition-all border-l-4 ${currentCampaignType === "HAPPY_BIRTHDAY"
            ? "border-l-purple-500 text-purple-600 bg-gray-50"
            : "border-l-transparent text-gray-500 hover:bg-gray-50"
            }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center text-lg ${currentCampaignType === "HAPPY_BIRTHDAY" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"}`}
            >
              <i className="fa-solid fa-cake-candles"></i>
            </div>
            <div>
              <span
                className={`block font-bold text-sm mt-0.5 ${currentCampaignType === "HAPPY_BIRTHDAY" ? "text-purple-600" : "text-gray-900"}`}
              >
                Chúc mừng sinh nhật
              </span>
              <span className="block text-[11px] text-gray-500 font-medium mt-1">
                Sinh nhật khách hàng
              </span>
            </div>
          </div>

        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-5 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:max-w-md">
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearchKeyword(e.target.value.trim());
            }}
            placeholder="Nhập tên hoặc số điện thoại khách hàng để lọc nhanh..."
            leftIcon={<i className="fa-solid fa-magnifying-glass text-xs"></i>}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
        <Table<Customer>
          columns={columns}
          data={tableData}
          isLoading={isLoading || isFetching}
          emptyText="Không tìm thấy khách hàng nào."
          rowKey={(row) => row.id}
        />
        {!isLoading && !isFetching && totalElements > 0 && (
          <div className="border-t border-gray-100 p-2">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={size}
              onPageChange={setPage}
              onSizeChange={setSize}
            />
          </div>
        )}
      </div>
      {/* Modal kịch bản gọi */}

    </div>
  );
}
