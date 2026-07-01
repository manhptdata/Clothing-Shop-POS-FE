import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCreateCareLogMutation, useLazyGetAiSuggestScriptQuery } from "@/redux/api/customerApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AiSuggestionModal from "./components/AiSuggestionModal";

export default function CareLogCreatePage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu tạm từ trang trước truyền sang (nếu có)
  const customerName = location.state?.customerName || "Khách hàng";
  const customerPhone = location.state?.customerPhone || "Đang tải...";
  const campaignId = location.state?.campaignId;

  const [createCareLog, { isLoading }] = useCreateCareLogMutation();
  const [fetchAiScript, { data: aiResponse, isFetching: isAiFetching, error: aiError }] = useLazyGetAiSuggestScriptQuery();

  const [result, setResult] = useState<string>("");
  const [potentialStatus, setPotentialStatus] = useState<string>(""); // State mới cho Đánh giá tiềm năng
  const [note, setNote] = useState("");
  const [nextRetryAt, setNextRetryAt] = useState("");
  const [errorResult, setErrorResult] = useState("");
  const [errorPotentialStatus, setErrorPotentialStatus] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleOpenAiSuggestion = () => {
    setIsAiModalOpen(true);
    if (campaignId) {
      fetchAiScript({ campaignId: Number(campaignId), customerId: Number(customerId) });
    } else {
      toast.error("Không có thông tin chiến dịch để gợi ý kịch bản!");
      setIsAiModalOpen(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!result) {
      setErrorResult("Vui lòng chọn kết quả cuộc gọi");
      hasError = true;
    } else {
      setErrorResult("");
    }

    if (!potentialStatus) {
      setErrorPotentialStatus("Vui lòng đánh giá mức độ tiềm năng của khách hàng");
      hasError = true;
    } else {
      setErrorPotentialStatus("");
    }

    if (hasError) return;

    let nextRetryAtISO = undefined;
    if (result === "HEN_GOI_LAI" && nextRetryAt) {
      nextRetryAtISO = new Date(nextRetryAt).toISOString();
    }

    try {
      await createCareLog({
        customerId: Number(customerId),
        result: result,
        potentialStatus: potentialStatus || undefined, // Truyền thêm potentialStatus
        note: note || undefined,
        nextRetryAt: nextRetryAtISO,
        campaignId: campaignId ? Number(campaignId) : undefined,
      }).unwrap();

      // Thành công thì quay về trang cũ và giữ nguyên tab
      handleGoBack();
    } catch (error: any) {
      console.error("Lỗi khi tạo lịch sử:", error);
      toast.error(`Đã xảy ra lỗi khi tạo lịch sử chăm sóc!\nChi tiết: ${JSON.stringify(error.data || error.message || error)}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto w-full text-gray-800 antialiased">
      <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div>

          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-file-medical text-blue-600"></i> Tạo nhật ký cuộc gọi mới
          </h1>
        </div>

        {/* Nút quay lại góc trên phải */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoBack}
          className="shadow-sm bg-white"
          leftIcon={<i className="fa-solid fa-arrow-left-long"></i>}
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
                Khách hàng nhận liên hệ
              </span>
              <span className="text-sm font-bold text-slate-900">
                {customerName}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                Số điện thoại
              </span>
              <span className="font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-xs">
                {customerPhone}
              </span>
            </div>
          </div>

          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleOpenAiSuggestion}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              Gợi ý kịch bản bằng AI
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kết quả cuộc gọi <span className="text-rose-500">*</span>
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
                  onClick={(e) => {
                    e.preventDefault(); // Chặn hành vi mặc định của label
                    if (result === opt.value) {
                      setResult(""); // Bỏ chọn nếu đang được chọn
                    } else {
                      setResult(opt.value);
                      setErrorResult(""); // Xoá lỗi khi chọn mới
                    }
                  }}
                  className={`border rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${result === opt.value
                    ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/20 scale-[1.02]"
                    : "border-gray-200 hover:border-blue-500 hover:bg-blue-50/10 hover:shadow-sm"
                    }`}
                >
                  <input
                    type="radio"
                    name="result"
                    value={opt.value}
                    className="sr-only"
                    checked={result === opt.value}
                    readOnly
                  />
                  <i className={`fa-solid ${opt.icon} text-sm mb-1.5`}></i>
                  <span className="font-bold text-gray-900">{opt.label}</span>
                </label>
              ))}
            </div>
            {errorResult && (
              <div className="mt-2 text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <i className="fa-solid fa-circle-exclamation text-xs"></i>
                <span className="text-[11px] font-bold">{errorResult}</span>
              </div>
            )}
          </div>

          {result === "HEN_GOI_LAI" && (
            <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl transition-all">
              <Input
                type="datetime-local"
                label="Thời gian hẹn gọi lại"
                value={nextRetryAt}
                onChange={(e) => setNextRetryAt(e.target.value)}
                leftIcon={
                  <i className="fa-solid fa-calendar-day text-amber-500 text-xs"></i>
                }
                className="text-xs font-semibold text-gray-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Đánh giá tiềm năng <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  value: "TIEM_NANG",
                  label: "Tiềm năng",
                  icon: "fa-star text-amber-400",
                },
                {
                  value: "MONG_LUNG",
                  label: "Chưa rõ (Mông lung)",
                  icon: "fa-circle-question text-indigo-400",
                },
                {
                  value: "KHONG_TIEM_NANG",
                  label: "Không tiềm năng",
                  icon: "fa-thumbs-down text-gray-400",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  onClick={(e) => {
                    e.preventDefault(); // Chặn hành vi mặc định của label
                    if (potentialStatus === opt.value) {
                      setPotentialStatus(""); // Bỏ chọn nếu đang được chọn
                    } else {
                      setPotentialStatus(opt.value);
                      setErrorPotentialStatus(""); // Xoá lỗi khi chọn mới
                    }
                  }}
                  className={`border rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${potentialStatus === opt.value
                    ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/30 shadow-md scale-[1.02]"
                    : "border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/10 hover:shadow-sm"
                    }`}
                >
                  <input
                    type="radio"
                    name="potentialStatus"
                    value={opt.value}
                    className="sr-only"
                    checked={potentialStatus === opt.value}
                    readOnly
                  />
                  <i className={`fa-solid ${opt.icon} text-sm mb-1.5`}></i>
                  <span className="font-bold text-gray-900">{opt.label}</span>
                </label>
              ))}
            </div>
            {errorPotentialStatus && (
              <div className="mt-2 text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <i className="fa-solid fa-circle-exclamation text-xs"></i>
                <span className="text-[11px] font-bold">{errorPotentialStatus}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nội dung cuộc trao đổi / Ghi chú
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-gray-800 transition shadow-sm"
              placeholder="Ghi nhận lại nhu cầu của khách, lý do hẹn gọi lại..."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoBack}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
              leftIcon={<i className="fa-solid fa-floppy-disk"></i>}
            >
              Hoàn thành & Lưu lịch sử
            </Button>
          </div>
        </form>
      </div>

      <AiSuggestionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        isLoading={isAiFetching}
        aiData={aiResponse?.data}
        error={aiError}
      />
    </div>
  );
}
