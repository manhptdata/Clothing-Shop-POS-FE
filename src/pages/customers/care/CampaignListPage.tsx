import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPendingCustomersByCampaignQuery } from "@/redux/api/customerApi";
import type { CampaignType, Customer } from "@/types/customer.types";
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
    switch (code) {
      case "GOLD":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm">
            <i className="fa-solid fa-crown text-[9px] text-amber-500"></i> GOLD
          </span>
        );
      case "SILVER":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm">
            <i className="fa-solid fa-medal text-[9px] text-slate-400"></i>{" "}
            SILVER
          </span>
        );
      case "BRONZE":
        return (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm">
            <i className="fa-solid fa-award text-[9px] text-orange-500"></i>{" "}
            BRONZE
          </span>
        );
      default:
        return (
          <span className="text-gray-400 text-[11px] font-medium">
            Chưa xếp hạng
          </span>
        );
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: "stt",
      header: <span className="text-center w-full block">STT</span>,
      className: "text-center text-gray-400 font-mono text-[11px]",
      render: (cust) => (cust as any).stt,
    },
    {
      key: "fullName",
      header: "Khách hàng",
      className: "font-bold text-gray-900 cursor-pointer",
      render: (cust) => (
        <span onClick={() => navigate(`/customers/${cust.id}`)}>
          {cust.fullName}
        </span>
      ),
    },
    {
      key: "phone",
      header: "SĐT",
      className: "font-mono text-gray-900 font-semibold text-blue-600",
      render: (cust) => cust.phone,
    },
    {
      key: "dobGender",
      header: "Ngày sinh & Giới tính",
      className: "text-gray-500",
      render: (cust) => (
        <>
          <span className="inline-flex items-center gap-1">
            <i className="fa-solid fa-cake-candles text-gray-400 text-[10px]"></i>{" "}
            {cust.dateOfBirth || "--"}
          </span>
          <span
            className={`ml-2 font-bold px-1.5 py-0.5 rounded text-[10px] ${cust.gender === "MALE" ? "text-blue-600 bg-blue-50" : "text-pink-600 bg-pink-50"}`}
          >
            {cust.gender}
          </span>
        </>
      ),
    },
    {
      key: "rank",
      header: "Hạng",
      render: (cust) => getRankBadge(cust.customerGroup?.code),
    },
    {
      key: "address",
      header: "Địa chỉ",
      className: "text-gray-600 max-w-[120px] truncate",
      render: (cust) => <span title={cust.address}>{cust.address || "--"}</span>,
    },
    {
      key: "note",
      header: "Ghi chú",
      className: "text-amber-600 italic max-w-[120px] truncate",
      render: (cust) => <span title={cust.note}>{cust.note || "--"}</span>,
    },
    {
      key: "status",
      header: <span className="text-center w-full block">Trạng thái</span>,
      className: "text-center",
      render: (cust) => (
        <div className="flex justify-center">
          <Badge variant={cust.status === "ACTIVE" ? "success" : "danger"}>
            {cust.status}
          </Badge>
        </div>
      ),
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
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <button
              onClick={() => navigate("/customers")}
              className="hover:text-blue-600 transition"
            >
              CRM / Chiến dịch
            </button>
            <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
            <span className="text-gray-900 font-semibold">
              Khách hàng chờ xử lý
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-headset text-blue-600"></i> Xử lý danh sách gọi điện theo chiến dịch
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
          <div
            className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex shrink-0 items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
            title="Xem kịch bản gọi điện"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedScript(scriptAfter7Days);
            }}
          >
            <i className="fa-solid fa-robot"></i>
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
          <div
            className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex shrink-0 items-center justify-center hover:bg-amber-200 transition-colors cursor-pointer"
            title="Xem kịch bản gọi điện"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedScript(scriptAfter30Days);
            }}
          >
            <i className="fa-solid fa-robot"></i>
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
          <div
            className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex shrink-0 items-center justify-center hover:bg-rose-200 transition-colors cursor-pointer"
            title="Xem kịch bản gọi điện"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedScript(scriptRecallSchedule);
            }}
          >
            <i className="fa-solid fa-robot"></i>
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
          <div
            className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex shrink-0 items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer"
            title="Xem kịch bản gọi điện"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedScript(scriptHappyBirthday);
            }}
          >
            <i className="fa-solid fa-robot"></i>
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
      <Modal
        isOpen={!!selectedScript}
        onClose={() => setSelectedScript(null)}
        title="Kịch bản gọi điện"
        size="lg"
      >
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-robot text-lg"></i>
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedScript}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
