import React, { useEffect, useState, useMemo } from 'react';
import { useNotifications, ShiftHandoverItem } from '@/providers/NotificationProvider';

export default function ShiftHistoryPage() {
  const { fetchHandoverHistory } = useNotifications();
  const [history, setHistory] = useState<ShiftHandoverItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== FILTER STATES =====
  const [searchName, setSearchName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  // ===== CLIENT-SIDE FILTER =====
  const filtered = useMemo(() => {
    return history.filter((item) => {
      const matchName =
        !searchName ||
        item.cashierUsername.toLowerCase().includes(searchName.toLowerCase());

      const itemDate = new Date(item.createdAt);
      const matchFrom = !dateFrom || itemDate >= new Date(dateFrom + 'T00:00:00');
      const matchTo = !dateTo || itemDate <= new Date(dateTo + 'T23:59:59');

      return matchName && matchFrom && matchTo;
    });
  }, [history, searchName, dateFrom, dateTo]);

  const uniqueNames = useMemo(
    () => [...new Set(history.map((i) => i.cashierUsername))].sort(),
    [history]
  );

  const hasFilter = searchName || dateFrom || dateTo;

  const handleClearFilter = () => {
    setSearchName('');
    setDateFrom('');
    setDateTo('');
  };

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

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Tên nhân viên */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">Nhân viên</label>
          <div className="relative">
            <input
              type="text"
              list="cashier-names-list"
              placeholder="Tìm theo tên..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-52 pl-9 pr-3 py-2 text-sm border border-outline/30 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <datalist id="cashier-names-list">
              {uniqueNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-base">
              person_search
            </span>
          </div>
        </div>

        {/* Từ ngày */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">Từ ngày</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 text-sm border border-outline/30 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Đến ngày */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">Đến ngày</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 text-sm border border-outline/30 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Nút xóa lọc */}
        {hasFilter && (
          <button
            onClick={handleClearFilter}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-500 border border-rose-500/30 rounded-lg hover:bg-rose-500/5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">filter_alt_off</span>
            Xóa lọc
          </button>
        )}

        {/* Kết quả đếm */}
        {hasFilter && (
          <span className="text-xs text-on-surface-variant self-end pb-2">
            {filtered.length} / {history.length} kết quả
          </span>
        )}
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
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-on-surface-variant/60">
            Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
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
                {filtered.map((item) => (
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
