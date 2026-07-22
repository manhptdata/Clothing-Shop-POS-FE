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
            <table className="w-full text-sm text-left border-collapse min-w-[900px]">
              <thead className="bg-outline/5 border-b border-outline/10 text-xs font-semibold text-on-surface uppercase">
                <tr>
                  <th className="px-4 py-3">Thu ngân</th>
                  <th className="px-4 py-3">Tên ca</th>
                  <th className="px-4 py-3">Thời gian mở ca</th>
                  <th className="px-4 py-3">Thời gian kết ca</th>
                  <th className="px-4 py-3 text-right">Tiền đầu ca</th>
                  <th className="px-4 py-3 text-right">Doanh thu ca</th>
                  <th className="px-4 py-3 text-right">Tiền đếm thực tế</th>
                  <th className="px-4 py-3 text-center">Chênh lệch két</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 text-on-surface text-xs">
                {filtered.map((item) => {
                  const discrepancy = item.discrepancy || 0;
                  return (
                    <tr key={item.id} className="hover:bg-outline/5 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-on-surface">{item.cashierUsername}</td>
                      <td className="px-4 py-3.5 font-medium text-primary">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
                          {item.shiftName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-on-surface-variant">{formatDate(item.openedAt || item.createdAt)}</td>
                      <td className="px-4 py-3.5 text-on-surface-variant">{item.closedAt ? formatDate(item.closedAt) : '---'}</td>
                      <td className="px-4 py-3.5 text-right font-medium">{formatCurrency(item.initialAmount || 0)}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-primary">{formatCurrency(item.systemAmount || 0)}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-secondary">{formatCurrency(item.actualAmount || 0)}</td>
                      <td className="px-4 py-3.5 text-center font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                            discrepancy === 0
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : discrepancy > 0
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}
                        >
                          {discrepancy === 0
                            ? 'Khớp 100%'
                            : discrepancy > 0
                            ? `Thừa +${formatCurrency(discrepancy)}`
                            : `Thiếu ${formatCurrency(discrepancy)}`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-semibold text-xs inline-block ${
                            item.status === 'OPEN'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-outline/10 text-on-surface-variant'
                          }`}
                        >
                          {item.status === 'OPEN' ? 'ĐANG MỞ' : 'ĐÃ KẾT CA'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
