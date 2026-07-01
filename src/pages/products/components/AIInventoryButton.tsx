import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

import { ENV } from '@/config/env';

export const AIInventoryButton = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [prompt, setPrompt] = useState('Hãy phân tích kho hàng này, chỉ ra sản phẩm bán chậm và sản phẩm cần nhập thêm.');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [days, setDays] = useState(30);

  const fetchAIReport = async () => {
    if (!prompt.trim()) {
      toast.error('Vui lòng nhập yêu cầu cho AI');
      return;
    }

    setLoading(true);
    setReport('');
    try {
      // Gọi API trực tiếp bằng fetch để đảm bảo độc lập với các logic/API hiện tại
      const token = localStorage.getItem('access_token'); // Sử dụng đúng key 'access_token'
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/ai/inventory-report`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ prompt: prompt, days: days }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const text = await response.text();
      setReport(text);
    } catch (error) {
      setReport('Không thể kết nối đến AI lúc này hoặc có lỗi xảy ra.');
      toast.error('Lỗi khi gọi AI');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
    setReport('');
  };

  return (
    <>
      <Button 
        variant="primary"
        onClick={openModal}
        className="bg-purple-600 hover:bg-purple-700 text-white border-none"
        leftIcon={<span className="material-symbols-outlined text-sm">smart_toy</span>}
      >
        AI Đánh Giá Kho
      </Button>

      <Modal 
        isOpen={isModalVisible} 
        onClose={() => !loading && setIsModalVisible(false)}
        title={
          <div className="flex items-center gap-2 text-purple-600">
            <span className="material-symbols-outlined">smart_toy</span> 
            Trợ lý AI Quản lý Kho
          </div>
        }
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Phân tích số liệu trong:
            </label>
            <select
              className="p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-sm"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              disabled={loading}
            >
              <option value={7}>7 ngày qua</option>
              <option value={14}>14 ngày qua</option>
              <option value={30}>30 ngày qua (1 tháng)</option>
              <option value={90}>90 ngày qua (3 tháng)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập quy định hoặc yêu cầu phân tích (Prompt):
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ví dụ: Phân tích các mặt hàng giá nhập > 500k xem có đang bị tồn đọng không?"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              variant="primary" 
              onClick={fetchAIReport} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? 'Đang phân tích...' : 'Bắt đầu đánh giá'}
            </Button>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Kết quả từ AI:</h4>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[150px] whitespace-pre-wrap text-sm text-gray-800">
              {loading ? (
                <div className="flex items-center justify-center h-full text-purple-600">
                  <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                  <span className="ml-2">Đang xử lý hàng ngàn dòng dữ liệu...</span>
                </div>
              ) : report ? (
                report
              ) : (
                <span className="text-gray-400 italic">Kết quả sẽ hiển thị ở đây.</span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
