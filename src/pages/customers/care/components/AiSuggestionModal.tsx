import React, { useState } from 'react';
import type { AiSuggestionResponseDto } from '@/types/customer.types';

interface AiSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  aiData?: AiSuggestionResponseDto;
  error?: any;
}

export default function AiSuggestionModal({ isOpen, onClose, isLoading, aiData, error }: AiSuggestionModalProps) {
  const [activeTab, setActiveTab] = useState<'call' | 'sms' | 'objection'>('call');

  if (!isOpen) return null;

  const handleCopySms = () => {
    if (aiData?.smsTemplate) {
      navigator.clipboard.writeText(aiData.smsTemplate);
      // Optional: Add a small toast if toast is available, for now simple alert or just silent
      alert('Đã copy mẫu tin nhắn!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
          <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            <i className="fa-solid fa-robot text-indigo-600"></i>
            AI Gợi ý kịch bản chăm sóc
          </h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            type="button"
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'call' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('call')}
          >
            Kịch bản gọi điện
          </button>
          <button
            type="button"
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'sms' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('sms')}
          >
            Mẫu tin nhắn (SMS/Zalo)
          </button>
          <button
            type="button"
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'objection' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('objection')}
          >
            Xử lý từ chối
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50 min-h-[250px] max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
              <div className="text-sm text-gray-400 mt-4 italic text-center">AI đang soạn kịch bản, vui lòng chờ trong giây lát...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 font-medium">
              Đã xảy ra lỗi khi gọi AI. Có thể API backend chưa sẵn sàng hoặc lỗi cấu hình.
              <br />
              <span className="text-xs text-red-400">
                {typeof error === 'string'
                  ? error
                  : String((error as any)?.data?.message || (error as any)?.error || (error as any)?.message || "Lỗi không xác định (Mở tab Network/Console F12 để xem chi tiết)")}
              </span>
            </div>
          ) : (
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {activeTab === 'call' && (aiData?.callScript ? String(aiData.callScript) : 'Chưa có gợi ý kịch bản.')}

              {activeTab === 'sms' && (
                <div className="relative">
                  <div className="bg-white p-4 border rounded-lg shadow-sm text-sm">
                    {aiData?.smsTemplate ? String(aiData.smsTemplate) : 'Chưa có mẫu tin nhắn.'}
                  </div>
                  {aiData?.smsTemplate && (
                    <button
                      type="button"
                      onClick={handleCopySms}
                      className="mt-3 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                    >
                      <i className="fa-regular fa-copy"></i> Copy tin nhắn
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'objection' && (aiData?.objectionHandling ? String(aiData.objectionHandling) : 'Chưa có thông tin xử lý từ chối.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
