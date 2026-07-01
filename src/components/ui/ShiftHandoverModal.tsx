import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useNotifications } from '@/providers/NotificationProvider';
import { useAppSelector } from '@/redux/hooks';
import toast from 'react-hot-toast';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({ isOpen, onClose }) => {
  const { fetchSystemAmount, submitShiftHandover } = useNotifications();
  const user = useAppSelector((state) => state.auth.user);

  const [shiftName, setShiftName] = useState('Ca sáng');
  const [systemAmount, setSystemAmount] = useState<number>(0);
  const [actualAmountStr, setActualAmountStr] = useState<string>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch today's system sales amount when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadSystemAmount = async () => {
        const amount = await fetchSystemAmount();
        setSystemAmount(amount);
        setActualAmountStr('');
        setNote('');
      };
      loadSystemAmount();
    }
  }, [isOpen, fetchSystemAmount]);

  const actualAmount = parseFloat(actualAmountStr) || 0;
  const discrepancy = actualAmount - systemAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      toast.error('Vui lòng nhập tên ca làm việc');
      return;
    }
    if (actualAmountStr === '') {
      toast.error('Vui lòng nhập số tiền mặt thực tế trong két');
      return;
    }

    setLoading(false);
    try {
      setLoading(true);
      await submitShiftHandover({
        shiftName,
        systemAmount,
        actualAmount,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bàn giao ca & Kiểm két tiền">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Cashier Info */}
        <div className="flex justify-between items-center bg-outline/5 p-3 rounded-lg border border-outline/10 text-xs">
          <span className="text-on-surface-variant font-medium">Nhân viên thực hiện:</span>
          <span className="text-on-surface font-semibold">{user?.fullName} ({user?.username})</span>
        </div>

        {/* Shift Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant">Tên ca làm việc</label>
          <select
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface border border-outline/20 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="Ca sáng">Ca sáng (06:00 - 12:00)</option>
            <option value="Ca chiều">Ca chiều (12:00 - 18:00)</option>
            <option value="Ca tối">Ca tối (18:00 - 23:00)</option>
            <option value="Khác">Khác / Tăng ca</option>
          </select>
        </div>

        {/* System Amount Display */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant">
            Doanh thu hệ thống tính (Tiền mặt ước tính)
          </label>
          <div className="w-full h-10 px-3 rounded-lg bg-outline/5 border border-outline/10 flex items-center justify-between text-sm font-semibold text-on-surface select-none">
            <span>{formatCurrency(systemAmount)}</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">Hệ thống</span>
          </div>
        </div>

        {/* Actual Amount Input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant">
            Số tiền mặt thực tế trong két (đ)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            required
            placeholder="Nhập số tiền mặt đếm được"
            value={actualAmountStr}
            onChange={(e) => setActualAmountStr(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface border border-outline/20 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Discrepancy Display */}
        {actualAmountStr !== '' && (
          <div className="flex justify-between items-center bg-outline/5 p-3 rounded-lg border border-outline/10 text-xs">
            <span className="text-on-surface-variant font-medium">Chênh lệch két tiền:</span>
            <span
              className={`font-bold ${
                discrepancy > 0 ? 'text-primary' : discrepancy < 0 ? 'text-rose-500' : 'text-on-surface'
              }`}
            >
              {discrepancy > 0 ? '+' : ''}
              {formatCurrency(discrepancy)}
              {discrepancy === 0 && ' (Khớp 100%)'}
              {discrepancy > 0 && ' (Thừa két)'}
              {discrepancy < 0 && ' (Thiếu két)'}
            </span>
          </div>
        )}

        {/* Note */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant">Ghi chú bàn giao ca (nếu có)</label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Thiếu 20.000đ do trả nhầm tiền cho khách hàng..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-lg bg-surface border border-outline/20 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 border-t border-outline/10 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-outline/20 hover:bg-outline/5 rounded-lg text-sm transition-colors text-on-surface font-semibold"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-primary hover:bg-primary/95 text-on-primary font-semibold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Xác nhận kết ca'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default ShiftHandoverModal;
