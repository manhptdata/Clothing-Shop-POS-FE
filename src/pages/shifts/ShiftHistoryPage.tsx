import React, { useEffect, useState } from 'react';
import { useNotifications, ShiftHandoverItem } from '@/providers/NotificationProvider';

export default function ShiftHistoryPage() {
  const { fetchHandoverHistory } = useNotifications();
  const [history, setHistory] = useState<ShiftHandoverItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await fetchHandoverHistory();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (err) {
        console.error('Failed to load handover history', err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [fetchHandoverHistory]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-on-surface">Lịch sử bàn giao ca</h1>
        <p className="text-sm text-on-surface-variant">
          Theo dõi doanh thu bàn giao, tiền mặt thực tế và chênh lệch két tiền của nhân viên POS.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-surface border border-outline/10 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-on-surface-variant/60">
            Đang tải dữ liệu lịch sử...
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-sm text-on-surface-variant/60">
            Chưa có lượt bàn giao ca nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-outline/5 border-b border-outline/10 text-xs font-semibold text-on-surface-variant">
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Nhân viên</th>
                  <th className="p-4">Ca làm việc</th>
                  <th className="p-4 text-right">Doanh thu hệ thống</th>
                  <th className="p-4 text-right">Tiền mặt thực tế</th>
                  <th className="p-4 text-right">Chênh lệch két</th>
                  <th className="p-4 max-w-xs">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 text-sm">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-outline/5 transition-colors">
                    <td className="p-4 text-xs text-on-surface-variant whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="p-4 font-medium text-on-surface">
                      {item.cashierUsername}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                        {item.shiftName}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-on-surface-variant">
                      {formatCurrency(item.systemAmount)}
                    </td>
                    <td className="p-4 text-right font-semibold text-on-surface">
                      {formatCurrency(item.actualAmount)}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-bold ${
                          item.discrepancy > 0
                            ? 'text-primary'
                            : item.discrepancy < 0
                            ? 'text-rose-500 font-bold'
                            : 'text-on-surface-variant/60'
                        }`}
                      >
                        {item.discrepancy > 0 ? '+' : ''}
                        {formatCurrency(item.discrepancy)}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant break-words max-w-xs">
                      {item.note || <span className="text-on-surface-variant/30 italic">Không có</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
