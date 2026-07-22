import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useNotifications, ShiftConfigItem } from '@/providers/NotificationProvider';
import { useAppSelector } from '@/redux/hooks';
import toast from 'react-hot-toast';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({ isOpen, onClose }) => {
  const { fetchSystemAmount, submitShiftHandover, fetchActiveShift, openShift, updateOpenShift, fetchShiftConfigs } = useNotifications();
  const user = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<'OPEN' | 'CLOSE'>('OPEN');
  const [activeShift, setActiveShift] = useState<any>(null);
  const [shiftConfigs, setShiftConfigs] = useState<ShiftConfigItem[]>([]);

  const [shiftName, setShiftName] = useState('Ca sáng');
  const [initialAmountStr, setInitialAmountStr] = useState<string>('0');
  const [systemAmount, setSystemAmount] = useState<number>(0);
  const [actualAmountStr, setActualAmountStr] = useState<string>('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  // Tải danh mục ca làm việc từ Backend & thông tin ca đang chạy khi Modal mở
  useEffect(() => {
    if (isOpen) {
      const initModal = async () => {
        setLoading(true);
        try {
          // Lấy danh mục ca cố định từ DB
          const configs = await fetchShiftConfigs();
          setShiftConfigs(configs);

          // Lấy thông tin ca đang hoạt động của thu ngân
          const active = await fetchActiveShift();
          setActiveShift(active);
          setShowConfirmCloseModal(false);

          if (active) {
            setActiveTab('CLOSE'); // Nếu đã mở ca thì mặc định tab Kết ca
            setShiftName(active.shiftName);
            setInitialAmountStr(active.initialAmount ? active.initialAmount.toString() : '0');
            const amount = await fetchSystemAmount();
            setSystemAmount(amount);
            setActualAmountStr('');
            setNote('');
          } else {
            setActiveTab('OPEN'); // Chưa có ca thì mặc định tab Mở ca
            if (configs && configs.length > 0) {
              const defaultShiftLabel = `${configs[0].name} (${configs[0].startTime.substring(0, 5)} - ${configs[0].endTime.substring(0, 5)})`;
              setShiftName(defaultShiftLabel);
            } else {
              setShiftName('Ca sáng (08:00 - 15:00)');
            }
            setInitialAmountStr('0');
            setSystemAmount(0);
            setActualAmountStr('');
            setNote('');
          }
        } catch (err) {
          console.error('Failed to initialize shift handover modal', err);
        } finally {
          setLoading(false);
        }
      };
      initModal();
    }
  }, [isOpen, fetchSystemAmount, fetchActiveShift, fetchShiftConfigs]);

  const initialAmount = parseFloat(initialAmountStr) || 0;
  const actualAmount = parseFloat(actualAmountStr) || 0;
  const expectedTotal = initialAmount + systemAmount;
  const discrepancy = actualAmount - expectedTotal;

  // Xử lý nộp form ở Tab Mở ca
  const handleOpenShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      toast.error('Vui lòng chọn Ca làm việc');
      return;
    }

    setLoading(true);
    try {
      if (!activeShift) {
        // Mở ca mới
        const res = await openShift({ shiftName, initialAmount });
        setActiveShift(res);
        setActiveTab('CLOSE');
      } else {
        // Cập nhật thông tin ca đang mở
        const res = await updateOpenShift({ shiftName, initialAmount });
        setActiveShift(res);
        toast.success('Đã cập nhật lại thông tin mở ca thành công');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mở Hộp thoại Xác nhận Kết ca
  const handleRequestCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (actualAmountStr === '') {
      toast.error('Vui lòng nhập số tiền mặt cuối ca thực tế đếm được');
      return;
    }
    setShowConfirmCloseModal(true);
  };

  // Thực hiện Kết ca sau khi bấm Xác nhận ở Dialog
  const handleConfirmCloseShift = async () => {
    setLoading(true);
    try {
      await submitShiftHandover({
        shiftName,
        initialAmount,
        systemAmount,
        actualAmount,
        note: note.trim() || undefined,
      });
      toast.success('Đã kết thúc ca và chốt két thành công!');
      setShowConfirmCloseModal(false);
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

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Vừa mới đây';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Quản lý & Bàn giao ca làm việc">
        <div className="flex flex-col gap-4">
          {/* Cashier Info Header */}
          <div className="flex justify-between items-center bg-outline/5 p-3 rounded-lg border border-outline/10 text-xs">
            <span className="text-on-surface-variant font-medium">Thu ngân thực hiện:</span>
            <span className="text-on-surface font-semibold">
              {user?.fullName} ({user?.username})
            </span>
          </div>

          {/* TAB BAR HEADER */}
          <div className="flex border-b border-outline/20">
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'OPEN'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveTab('OPEN')}
            >
              1. Mở ca {activeShift && '(Đang mở)'}
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'CLOSE'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              } ${!activeShift ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (!activeShift) {
                  toast.error('Bạn cần thực hiện Mở ca làm việc trước khi Kết ca');
                  return;
                }
                setActiveTab('CLOSE');
              }}
            >
              2. Kết ca bàn giao
            </button>
          </div>

          {/* TAB CONTENT 1: MỞ CA / CHỈNH SỬA MỞ CA */}
          {activeTab === 'OPEN' && (
            <form onSubmit={handleOpenShiftSubmit} className="flex flex-col gap-4 pt-2">
              {activeShift && (
                <div className="bg-primary/10 text-primary p-3 rounded-lg text-xs font-medium border border-primary/20">
                  Ca làm việc của bạn đang mở từ lúc <strong>{formatTimestamp(activeShift.openedAt || activeShift.createdAt)}</strong>. Bạn có thể chọn lại Ca hoặc sửa Số tiền đầu ca bên dưới rồi bấm <strong>Cập nhật</strong>.
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Chọn Ca làm việc chuẩn</label>
                {shiftConfigs && shiftConfigs.length > 0 ? (
                  <select
                    className="input-field cursor-pointer font-medium"
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    required
                  >
                    {shiftConfigs.map((cfg) => {
                      const label = `${cfg.name} (${cfg.startTime.substring(0, 5)} - ${cfg.endTime.substring(0, 5)})`;
                      return (
                        <option key={cfg.id} value={label}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="input-field"
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    required
                    placeholder="VD: Ca sáng (08:00 - 15:00)..."
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Số tiền mặt đầu ca nhận được (đ)</label>
                <input
                  type="number"
                  className="input-field font-semibold text-primary"
                  value={initialAmountStr}
                  onChange={(e) => setInitialAmountStr(e.target.value)}
                  min="0"
                  step="1000"
                  required
                  placeholder="Nhập số tiền nhận giao két đầu ca..."
                />
                {initialAmount > 0 && (
                  <p className="text-xs text-on-surface-variant font-medium mt-1">
                    Tương đương: {formatCurrency(initialAmount)}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-outline/10">
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
                  Đóng
                </button>
                <button type="submit" className="btn btn-primary min-w-[140px]" disabled={loading}>
                  {loading
                    ? 'Đang xử lý...'
                    : activeShift
                    ? 'Cập nhật thông tin mở ca'
                    : 'Xác nhận mở ca'}
                </button>
              </div>
            </form>
          )}

          {/* TAB CONTENT 2: KẾT CA BÀN GIAO */}
          {activeTab === 'CLOSE' && (
            <form onSubmit={handleRequestCloseShift} className="flex flex-col gap-4 pt-2">
              <div className="grid grid-cols-2 gap-3 bg-outline/5 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-on-surface-variant">Tên ca:</span>{' '}
                  <strong className="text-on-surface">{shiftName}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant">Tiền đầu ca:</span>{' '}
                  <strong className="text-primary">{formatCurrency(initialAmount)}</strong>
                </div>
                {activeShift && (
                  <div className="col-span-2 text-on-surface-variant pt-1 border-t border-outline/10">
                    Thời gian mở ca thực tế: <strong className="text-on-surface">{formatTimestamp(activeShift.openedAt || activeShift.createdAt)}</strong>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface-variant">Doanh thu hệ thống tính tự động</label>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex justify-between items-center">
                  <span className="text-sm font-medium text-primary">Doanh thu tiền mặt trong ca:</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(systemAmount)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">
                  Số tiền mặt thực tế kiểm đếm cuối ca <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  className="input-field font-bold text-lg text-secondary"
                  value={actualAmountStr}
                  onChange={(e) => setActualAmountStr(e.target.value)}
                  min="0"
                  step="1000"
                  required
                  placeholder="Nhập số tiền thực tế bạn đếm được..."
                />
                <div className="flex justify-between items-center mt-1 px-1">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Tổng lý thuyết (Đầu ca + Doanh thu): <strong className="text-on-surface">{formatCurrency(expectedTotal)}</strong>
                  </span>
                  {actualAmountStr !== '' && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        discrepancy === 0
                          ? 'bg-success/10 text-success'
                          : discrepancy > 0
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      {discrepancy === 0
                        ? 'Khớp 100%'
                        : discrepancy > 0
                        ? `Thừa +${formatCurrency(discrepancy)}`
                        : `Thiếu ${formatCurrency(discrepancy)}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Ghi chú bàn giao ca</label>
                <textarea
                  className="input-field min-h-[70px] resize-none"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Giải trình chênh lệch hoặc ghi chú bàn giao cho ca sau..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-outline/10">
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary min-w-[140px]"
                  disabled={loading || actualAmountStr === ''}
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận kết ca'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* CONFIRMATION DIALOG / LOG XÁC NHẬN KẾT CA */}
      {showConfirmCloseModal && (
        <Modal
          isOpen={showConfirmCloseModal}
          onClose={() => setShowConfirmCloseModal(false)}
          title="XÁC NHẬN KẾT THÚC CA LÀM VIỆC"
        >
          <div className="flex flex-col gap-4">
            <div className="bg-error/10 text-error p-3.5 rounded-lg border border-error/20 text-sm leading-relaxed">
              <p className="font-bold text-base mb-1">Cảnh báo chốt khóa dữ liệu!</p>
              Bạn có chắc chắn muốn <strong>kết thúc ca làm việc này</strong> không?
              <br />
              Sau khi xác nhận, toàn bộ số liệu bàn giao ca sẽ được chốt và <strong>KHÔNG THỂ chỉnh sửa ca này nữa</strong>.
            </div>

            <div className="bg-outline/5 p-3 rounded-lg text-xs flex flex-col gap-1.5 border border-outline/10">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tên ca:</span>
                <span className="font-medium text-on-surface">{shiftName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tổng tiền lý thuyết:</span>
                <span className="font-medium text-on-surface">{formatCurrency(expectedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tiền đếm được:</span>
                <span className="font-bold text-secondary">{formatCurrency(actualAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-outline/10 pt-1 mt-0.5">
                <span className="text-on-surface-variant">Chênh lệch két:</span>
                <span
                  className={`font-bold ${
                    discrepancy === 0
                      ? 'text-success'
                      : discrepancy > 0
                      ? 'text-secondary'
                      : 'text-error'
                  }`}
                >
                  {discrepancy === 0
                    ? 'Khớp 100%'
                    : discrepancy > 0
                    ? `Thừa +${formatCurrency(discrepancy)}`
                    : `Thiếu ${formatCurrency(discrepancy)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowConfirmCloseModal(false)}
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn bg-error text-white hover:bg-error/90 font-semibold"
                onClick={handleConfirmCloseShift}
                disabled={loading}
              >
                {loading ? 'Đang chốt ca...' : 'Đồng ý kết ca'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ShiftHandoverModal;
