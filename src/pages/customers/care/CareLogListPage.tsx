import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSearchCareLogsQuery, useDeleteCareLogMutation } from "@/redux/api/customerApi";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CustomerCareLog } from "@/types/customer.types";

export default function CareLogListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [deleteConfirmLogId, setDeleteConfirmLogId] = useState<number | string | null>(null);

  const [deleteCareLog] = useDeleteCareLogMutation();

  const { data: responseData, isLoading } = useSearchCareLogsQuery({
    page,
    size,
    keyword,
    result: resultFilter === "ALL" ? undefined : resultFilter,
  });

  const logs = responseData?.data?.content || [];
  const totalElements = responseData?.data?.totalElements || 0;
  const totalPages = responseData?.data?.totalPages || 0;

  // Tính toán thêm STT vào data
  const tableData = logs.map((log, index) => ({
    ...log,
    stt: page * size + index + 1,
  }));

  // Cấu hình cột cho bảng
  const columns: Column<CustomerCareLog>[] = [
    {
      key: "id",
      header: <span className="text-center w-full block">STT</span>,
      className: "text-center text-gray-400 font-mono text-[11px]",
      render: (log) => (log as any).stt,
    },
    {
      key: "result",
      header: (
        <span className="text-center w-full block">Kết quả cuộc gọi</span>
      ),
      className: "text-center",
      render: (log) => {
        let label = log.result;
        let variant: "success" | "warning" | "danger" | "neutral" | "info" = "neutral";

        switch (log.result) {
          case "NGHE_MAY":
            label = "Nghe máy";
            variant = "success";
            break;
          case "HEN_GOI_LAI":
            label = "Hẹn gọi lại";
            variant = "warning";
            break;
          case "GOI_NHO":
            label = "Cuộc gọi nhỡ";
            variant = "danger";
            break;
          case "TU_CHOI":
            label = "Từ chối";
            variant = "neutral";
            break;
        }

        return (
          <Badge variant={variant}>
            {label}
          </Badge>
        );
      },
    },
    {
      key: "calledAt",
      header: <span className="text-center w-full block">Thời gian gọi</span>,
      className: "text-center text-gray-700 font-mono text-[11px]",
      render: (log) =>
        log.calledAt ? new Date(log.calledAt).toLocaleString("vi-VN") : "--",
    },
    {
      key: "customer",
      header: "Khách hàng nhận",
      render: (log) => (
        <div>
          <div className="font-bold text-gray-900">{log.customer.fullName}</div>
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
            <i className="fa-solid fa-phone text-[9px] text-gray-400"></i>{" "}
            {log.customer.phone}
          </div>
        </div>
      ),
    },
    {
      key: "campaign",
      header: "Chiến dịch",
      render: (log) => (
        <div className="flex justify-center">
          {log.campaign ? (
            <div className="text-[11px] font-bold text-purple-600 font-mono px-2 py-1 bg-purple-50 rounded border border-purple-100 uppercase tracking-wider">
              {log.campaign.type || log.campaign.name}
            </div>
          ) : (
            <span className="text-gray-400 italic text-[11px]">Không có</span>
          )}
        </div>
      ),
    },
    {
      key: "calledBy",
      header: "Nhân viên gọi",
      render: (log) => (
        <div>
          <div className="font-bold text-gray-800">
            {log.calledBy?.fullName || "--"}
          </div>
          <div className="text-[11px] text-blue-600 font-mono mt-0.5">
            <i className="fa-solid fa-user-tie text-[9px] text-blue-400"></i>{" "}
            {log.calledBy?.username || "--"}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: <span className="text-center w-full block">Thao tác</span>,
      className: "text-center",
      render: (log) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() =>
              navigate(`/customers/care/history/log/${log.id}`)
            }
            className="p-1.5 bg-gray-50 text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-lg transition-all active:scale-90 shadow-sm"
            title="Xem chi tiết nhật ký"
          >
            <i className="fa-solid fa-eye text-sm"></i>
          </button>

          <button
            onClick={() => setDeleteConfirmLogId(log.id)}
            className="p-1.5 bg-gray-50 text-gray-500 hover:text-rose-600 border border-gray-200 hover:border-rose-200 rounded-lg transition-all active:scale-90 shadow-sm"
            title="Xóa nhật ký này"
          >
            <i className="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full text-gray-800 antialiased">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <Link to="/customers" className="hover:text-blue-600 transition">
              CRM
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
            <span className="text-gray-900 font-semibold">
              Nhật ký chăm sóc toàn cửa hàng
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-blue-600"></i> Toàn
            bộ nhật ký chăm sóc khách hàng
          </h1>
        </div>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i> Quay lại
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-5 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row w-full gap-4">
          <div className="w-full sm:max-w-md">
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              placeholder="Nhập tên hoặc số điện thoại khách hàng để tra cứu..."
              leftIcon={<i className="fa-solid fa-magnifying-glass"></i>}
            />
          </div>
          <div className="w-full sm:max-w-xs">
            <Select
              value={resultFilter}
              onChange={(val) => {
                setResultFilter(val);
                setPage(0);
              }}
              options={[
                { label: "Tất cả kết quả", value: "ALL" },
                { label: "Nghe máy", value: "NGHE_MAY" },
                { label: "Hẹn gọi lại", value: "HEN_GOI_LAI" },
                { label: "Cuộc gọi nhỡ", value: "GOI_NHO" },
                { label: "Từ chối", value: "TU_CHOI" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={tableData}
          isLoading={isLoading}
          emptyMessage="Không tìm thấy nhật ký chăm sóc nào."
        />

        {/* Pagination */}
        <div className="border-t border-gray-100 bg-gray-50/50">
          <Pagination
            className="w-full"
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalElements={totalElements}
            pageSize={size}
            onSizeChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmLogId !== null}
        onClose={() => setDeleteConfirmLogId(null)}
        title="Xác nhận xóa nhật ký"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirmLogId(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (deleteConfirmLogId !== null) {
                  try {
                    await deleteCareLog(deleteConfirmLogId).unwrap();
                    setDeleteConfirmLogId(null);
                  } catch (error) {
                    console.error("Lỗi khi xóa nhật ký:", error);
                    alert("Đã xảy ra lỗi khi xóa nhật ký!");
                  }
                }
              }}
            >
              Xóa nhật ký
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Bạn có chắc chắn muốn xóa nhật ký chăm sóc này không? Hành động này <strong className="text-rose-600">không thể hoàn tác</strong>.
        </p>
      </Modal>
    </div>
  );
}
