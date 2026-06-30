import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCareLogByIdQuery,
  useUpdateCareLogMutation,
} from "@/redux/api/customerApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CareLogEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. GỌI API LẤY DATA CŨ CỦA NHẬT KÝ ĐỂ ĐỔ LÊN FORM
  const { data: logData, isLoading: isFetching } = useGetCareLogByIdQuery(
    id || "",
  );
  const log = logData?.data;

  // 2. KHAI BÁO HÀM API UPDATE
  const [updateCareLog, { isLoading: isUpdating }] = useUpdateCareLogMutation();

  const [result, setResult] = useState<string>("");
  const [note, setNote] = useState("");
  const [nextRetryAt, setNextRetryAt] = useState("");
  const [errorResult, setErrorResult] = useState("");
  const [useAi, setUseAi] = useState(false);

  // 3. FILL DỮ LIỆU CŨ VÀO STATE KHI API TRẢ VỀ THÀNH CÔNG
  useEffect(() => {
    if (log) {
      setResult(log.result || "");
      setNote(log.note || "");

      if (log.nextRetryAt) {
        // Chuyển chuỗi ISO từ DB thành format YYYY-MM-DDThh:mm để thẻ datetime-local đọc được
        const date = new Date(log.nextRetryAt);
        const tzOffset = new Date().getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - tzOffset)
          .toISOString()
          .slice(0, 16);
        setNextRetryAt(localISOTime);
      }
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payloadResult = useAi ? "BO_TRONG" : result;
    if (!useAi && !result) {
      setErrorResult("Kết quả cuộc gọi không được để trống");
      return;
    }
    setErrorResult("");

    let nextRetryAtISO = null;
    if (!useAi && result === "HEN_GOI_LAI" && nextRetryAt) {
      nextRetryAtISO = new Date(nextRetryAt).toISOString();
    }

    try {
      if (log) {
        await updateCareLog({
          id: Number(id),
          data: {
            customerId: log.customer.id,
            result: payloadResult,
            note: note || undefined,
            nextRetryAt: nextRetryAtISO,
            campaignId: log.campaign?.id,
          },
        }).unwrap();
      }

      // Thành công thì lùi lại về màn hình Chi tiết
      navigate(-1);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật lịch sử:", error);
      toast.error(
        `Đã xảy ra lỗi khi cập nhật!\nChi tiết: ${JSON.stringify(error.data || error.message || error)}`,
      );
    }
  };

  if (isFetching) {
    return (
      <div className="p-6 text-center text-gray-500 font-semibold">
        Đang tải dữ liệu cũ...
      </div>
    );
  }

  if (!log) {
    return (
      <div className="p-6 text-center text-rose-500 font-semibold">
        Không tìm thấy nhật ký chăm sóc!
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto w-full text-gray-800 antialiased">
      <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <span
              className="cursor-pointer hover:text-blue-600 transition"
              onClick={() => navigate(-1)}
            >
              CRM / Nhật ký
            </span>
            <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
            <span className="text-gray-900 font-semibold">
              Chỉnh sửa nhật ký
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-file-pen text-amber-500"></i> Cập nhật
            nhật ký chăm sóc
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="shadow-sm bg-white"
          leftIcon={<i className="fa-solid fa-arrow-left"></i>}
        >
          Quay lại
        </Button>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 text-xs font-semibold"
        >
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                Khách hàng thuộc nhật ký
              </span>
              <span className="text-sm font-bold text-slate-900">
                {log.customer.fullName}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                Số điện thoại
              </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-xs">
                {log.customer.phone}
              </span>
            </div>
          </div>

          {/* CÔNG TẮC PHÂN LOẠI AI */}
          <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl border border-purple-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
                <i className="fa-solid fa-wand-magic-sparkles"></i> Phân loại tự động bằng AI
              </h3>
              <p className="text-[11px] text-purple-700/80 font-medium mt-0.5">
                AI sẽ tự động phân tích "Ghi chú" của bạn để đánh giá thái độ khách hàng và kết quả cuộc gọi.
              </p>
            </div>

            {/* Nút Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useAi}
                onChange={(e) => {
                  setUseAi(e.target.checked);
                  if (e.target.checked) setResult(""); // Xoá lựa chọn kết quả khi bật AI
                }}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kết quả cuộc gọi (result) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  value: "NGHE_MAY",
                  label: "Nghe máy",
                  icon: "fa-phone-flip text-emerald-500",
                },
                {
                  value: "HEN_GOI_LAI",
                  label: "Hẹn gọi lại",
                  icon: "fa-clock text-amber-500",
                },
                {
                  value: "GOI_NHO",
                  label: "Cuộc gọi nhỡ",
                  icon: "fa-phone-slash text-rose-400",
                },
                {
                  value: "TU_CHOI",
                  label: "Từ chối",
                  icon: "fa-user-slash text-gray-400",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`border rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${useAi
                      ? "border-gray-100 bg-gray-50/50 cursor-not-allowed"
                      : result === opt.value
                        ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/20 scale-[1.02]"
                        : "border-gray-200 hover:border-blue-500 hover:bg-blue-50/10 hover:shadow-sm"
                    }`}
                >
                  <input
                    type="radio"
                    name="result"
                    value={opt.value}
                    className="sr-only"
                    checked={!useAi && result === opt.value}
                    onChange={(e) => setResult(e.target.value)}
                    disabled={useAi}
                  />
                  <i className={`fa-solid ${opt.icon} text-sm mb-1.5 ${useAi ? "opacity-50 grayscale" : ""}`}></i>
                  <span className={`font-bold ${useAi ? "text-gray-400" : "text-gray-900"}`}>{opt.label}</span>
                </label>
              ))}
            </div>
            {errorResult && (
              <p className="text-rose-500 text-[10px] mt-1 font-semibold">
                {errorResult}
              </p>
            )}
          </div>

          {useAi && (
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl transition-all flex items-start gap-2.5">
              <i className="fa-solid fa-robot text-blue-500 mt-0.5"></i>
              <div className="text-blue-800 text-[11px] font-medium leading-relaxed">
                <strong className="block mb-0.5">AI đang theo dõi thời gian!</strong>
                Hãy ghi chú thời gian hẹn lại vào ô bên dưới (VD: <i>"chiều mai 5h gọi lại", "hẹn sang tuần"</i>). AI sẽ tự đọc hiểu và dời lịch hệ thống thay bạn.
              </div>
            </div>
          )}

          <div
            className={`bg-amber-50/40 border border-amber-100 p-4 rounded-xl transition-all ${!useAi && result === "HEN_GOI_LAI" ? "block" : "hidden"}`}
          >
            <Input
              type="datetime-local"
              label="Thời gian hẹn gọi lại (nextRetryAt)"
              value={nextRetryAt}
              onChange={(e) => setNextRetryAt(e.target.value)}
              leftIcon={
                <i className="fa-solid fa-calendar-day text-amber-500 text-xs"></i>
              }
              className="text-xs font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nội dung cuộc trao đổi / Ghi chú (note)
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-gray-800 transition shadow-sm"
              placeholder="Ghi nhận lại phản hồi..."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Hủy thay đổi
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating}
              isLoading={isUpdating}
              leftIcon={<i className="fa-solid fa-floppy-disk"></i>}
            >
              Cập nhật nhật ký
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
