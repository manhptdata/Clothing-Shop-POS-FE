import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetReturnOrdersQuery } from '@/redux/api/orderApi';
import type { ReturnOrder } from '@/types/order.types';

interface DamagedProductSummary {
  variantId: number;
  productName: string;
  productSku: string;
  totalQuantity: number;
  totalRefund: number;
  returnCount: number;
}

interface DamagedLogItem {
  id: string;
  returnId: number;
  returnNumber: string;
  originalOrderId: number;
  originalOrderNumber: string;
  createdAt: string;
  createdByUsername: string;
  customerName: string;
  productName: string;
  productSku: string;
  quantity: number;
  refundPrice: number;
  subtotal: number;
  reason: string;
}

export default function DamagedItemsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'summary' | 'logs'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);

  // Fetch all return orders (page 1, size 300 to aggregate)
  const { data: returnResponse, isLoading } = useGetReturnOrdersQuery({
    page: 1,
    size: 300,
    sort: 'createdAt,desc',
  });

  const returnOrders = useMemo(() => {
    const rawData = returnResponse?.data as any;
    if (Array.isArray(rawData)) return rawData;
    return rawData?.result || rawData?.content || [];
  }, [returnResponse]);

  // Extract all damaged return line items (isRestocked === false or restocked === false)
  const damagedLogs = useMemo(() => {
    const logs: DamagedLogItem[] = [];
    returnOrders.forEach((retOrder: ReturnOrder) => {
      retOrder.items?.forEach((item) => {
        const isDamaged = item.isRestocked === false || (item as any).restocked === false;
        if (isDamaged) {
          logs.push({
            id: `${retOrder.id}-${item.id || item.variantId}`,
            returnId: retOrder.id,
            returnNumber: retOrder.returnNumber,
            originalOrderId: retOrder.originalOrderId,
            originalOrderNumber: retOrder.originalOrderNumber,
            createdAt: retOrder.createdAt,
            createdByUsername: retOrder.createdByUsername,
            customerName: retOrder.customerName || 'Khách lẻ vãng lai',
            productName: item.productName || `Sản phẩm #${item.variantId}`,
            productSku: item.productSku || 'N/A',
            quantity: item.quantity,
            refundPrice: item.refundPrice,
            subtotal: item.subtotal,
            reason: retOrder.reason || 'Khách trả hàng hỏng/lỗi',
          });
        }
      });
    });
    return logs;
  }, [returnOrders]);

  // Aggregate by product SKU / variant ID
  const damagedSummary = useMemo(() => {
    const map = new Map<string, DamagedProductSummary>();

    damagedLogs.forEach((log) => {
      const key = log.productSku !== 'N/A' ? log.productSku : `${log.variantId}`;
      const existing = map.get(key);
      if (existing) {
        existing.totalQuantity += log.quantity;
        existing.totalRefund += log.subtotal;
        existing.returnCount += 1;
      } else {
        map.set(key, {
          variantId: 0,
          productName: log.productName,
          productSku: log.productSku,
          totalQuantity: log.quantity,
          totalRefund: log.subtotal,
          returnCount: 1,
        });
      }
    });

    return Array.from(map.values());
  }, [damagedLogs]);

  // Filter by search query
  const filteredSummary = useMemo(() => {
    if (!searchQuery) return damagedSummary;
    const q = searchQuery.toLowerCase();
    return damagedSummary.filter(
      (item) => item.productName.toLowerCase().includes(q) || item.productSku.toLowerCase().includes(q)
    );
  }, [damagedSummary, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return damagedLogs;
    const q = searchQuery.toLowerCase();
    return damagedLogs.filter(
      (log) =>
        log.productName.toLowerCase().includes(q) ||
        log.productSku.toLowerCase().includes(q) ||
        log.returnNumber.toLowerCase().includes(q) ||
        log.originalOrderNumber.toLowerCase().includes(q)
    );
  }, [damagedLogs, searchQuery]);

  // Metric stats
  const totalProductTypes = damagedSummary.length;
  const totalDamagedQty = damagedSummary.reduce((sum, i) => sum + i.totalQuantity, 0);
  const totalLossAmount = damagedSummary.reduce((sum, i) => sum + i.totalRefund, 0);

  return (
    <div className="flex-1 px-6 pb-6 pt-2 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
            Kho hàng lỗi & Phế phẩm
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Báo cáo, thống kê và kiểm kê toàn bộ sản phẩm bị hỏng/lỗi không thể nhập lại kho bán.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 shrink-0">
          <span className="material-symbols-outlined text-[18px]">report_problem</span>
          <span>Thất thoát phế phẩm</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-6">
        <div className="bg-surface p-md rounded-xl border border-outline/10 flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">inventory_2</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant block font-medium">Mẫu sản phẩm bị lỗi</span>
            <span className="text-2xl font-bold text-on-surface">{totalProductTypes} <span className="text-sm font-normal text-on-surface-variant">loại</span></span>
          </div>
        </div>

        <div className="bg-surface p-md rounded-xl border border-outline/10 flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">warning</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant block font-medium">Tổng số lượng phế phẩm</span>
            <span className="text-2xl font-bold text-rose-600">{totalDamagedQty} <span className="text-sm font-normal text-rose-500">sản phẩm</span></span>
          </div>
        </div>

        <div className="bg-surface p-md rounded-xl border border-outline/10 flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">payments</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant block font-medium">Tổng tiền hoàn thất thoát</span>
            <span className="text-2xl font-bold text-rose-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalLossAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex justify-between items-center mb-md border-b border-outline/10 pb-2">
        <div className="flex gap-md">
          <button
            onClick={() => setActiveTab('summary')}
            className={`font-semibold text-base pb-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-on-surface-variant hover:text-rose-600'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Thống kê gộp sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`font-semibold text-base pb-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-on-surface-variant hover:text-rose-600'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            Nhật ký đợt trả hàng lỗi ({damagedLogs.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder={activeTab === 'summary' ? 'Tìm tên SP, SKU...' : 'Tìm phiếu trả, tên SP...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-surface rounded-lg border border-outline/20 focus:outline-none focus:border-rose-500 text-xs text-on-surface"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-surface rounded-xl border border-outline/10 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-rose-600">sync</span>
            <p className="font-medium text-sm">Đang tổng hợp dữ liệu phế phẩm...</p>
          </div>
        ) : activeTab === 'summary' ? (
          // TAB 1: SUMMARY TABLE
          filteredSummary.length === 0 ? (
            <div className="py-20 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-emerald-500 opacity-80">check_circle</span>
              <p className="text-sm font-medium">Không ghi nhận sản phẩm lỗi nào.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-surface-container border-b border-outline/10 text-on-surface-variant">
                <tr>
                  <th className="py-3 px-4 font-semibold">Sản phẩm bị lỗi</th>
                  <th className="py-3 px-4 text-center font-semibold">Mã SKU</th>
                  <th className="py-3 px-4 text-center font-semibold">Số lượng hỏng</th>
                  <th className="py-3 px-4 text-center font-semibold">Số đợt nhận trả</th>
                  <th className="py-3 px-4 text-right font-semibold">Tiền hoàn thất thoát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {filteredSummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      {item.productName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-on-surface-variant">
                      {item.productSku}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        {item.totalQuantity} chiếc
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-on-surface-variant font-medium">
                      {item.returnCount} lượt
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalRefund)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          // TAB 2: DETAILED LOGS AUDIT TRAIL
          filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline/40">assignment_turned_in</span>
              <p className="text-sm font-medium">Chưa có nhật ký trả hàng lỗi nào.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-surface-container border-b border-outline/10 text-on-surface-variant">
                <tr>
                  <th className="py-3 px-4 font-semibold">Thời gian</th>
                  <th className="py-3 px-4 font-semibold">Mã phiếu trả</th>
                  <th className="py-3 px-4 font-semibold">Sản phẩm hỏng</th>
                  <th className="py-3 px-4 text-center font-semibold">SL trả lỗi</th>
                  <th className="py-3 px-4 font-semibold">Lý do từ khách</th>
                  <th className="py-3 px-4 text-right font-semibold">Tiền hoàn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                      <span 
                        className="cursor-pointer hover:underline" 
                        onClick={() => {
                          const match = returnOrders.find((r: ReturnOrder) => r.id === log.returnId);
                          if (match) setSelectedReturn(match);
                        }}
                      >
                        {log.returnNumber}
                      </span>
                      <span className="block text-[10px] text-on-surface-variant font-normal">
                        HĐ gốc: <span className="hover:underline cursor-pointer" onClick={() => navigate(`/orders/${log.originalOrderId}`)}>{log.originalOrderNumber}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold block text-on-surface">{log.productName}</span>
                      <span className="text-xs text-on-surface-variant font-mono">SKU: {log.productSku}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">
                        {log.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs italic text-on-surface-variant max-w-[220px]">
                      "{log.reason}"
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(log.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Return Order Detail Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-outline/10 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-md border-b border-outline/10 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[28px]">assignment_return</span>
                Chi tiết phiếu trả: {selectedReturn.returnNumber}
              </h3>
              <button 
                onClick={() => setSelectedReturn(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-md overflow-y-auto flex-1 space-y-md">
              <div className="grid grid-cols-2 gap-sm text-sm bg-surface-container-lowest p-sm rounded-xl border border-outline/5">
                <div>
                  <span className="text-on-surface-variant block text-xs">Mã hóa đơn gốc:</span>
                  <span 
                    className="font-semibold text-primary cursor-pointer hover:underline" 
                    onClick={() => {
                      navigate(`/orders/${selectedReturn.originalOrderId}`);
                      setSelectedReturn(null);
                    }}
                  >
                    {selectedReturn.originalOrderNumber}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs">Khách hàng:</span>
                  <span className="font-semibold text-on-surface">{selectedReturn.customerName || 'Khách lẻ vãng lai'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs">Ngày thực hiện:</span>
                  <span className="text-on-surface">{new Date(selectedReturn.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs">Người lập phiếu:</span>
                  <span className="text-on-surface">{selectedReturn.createdByUsername}</span>
                </div>
              </div>

              <div className="space-y-xs">
                <span className="text-xs text-on-surface-variant font-bold block">Sản phẩm hoàn trả trong đợt này:</span>
                <div className="border border-outline/10 rounded-xl overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline/10 font-bold">
                        <th className="py-2 px-3">Sản phẩm</th>
                        <th className="py-2 px-3 text-center">SL</th>
                        <th className="py-2 px-3 text-center">Trạng thái kho</th>
                        <th className="py-2 px-3 text-right">Giá hoàn</th>
                        <th className="py-2 px-3 text-right font-bold">Tổng hoàn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/5">
                      {selectedReturn.items?.map((item) => {
                        const isDamaged = item.isRestocked === false || (item as any).restocked === false;
                        return (
                          <tr key={item.id} className="hover:bg-surface-container-lowest/30">
                            <td className="py-2 px-3">
                              <span className="font-semibold block">{item.productName}</span>
                              <span className="text-[10px] text-on-surface-variant">SKU: {item.productSku}</span>
                            </td>
                            <td className="py-2 px-3 text-center">{item.quantity}</td>
                            <td className="py-2 px-3 text-center">
                              {isDamaged ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                                  🔴 Hàng hỏng/lỗi
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  🟢 Đã nhập lại kho
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.refundPrice)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-primary">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedReturn.reason && (
                <div className="bg-surface-container-lowest p-sm rounded-xl border border-outline/5 text-sm">
                  <span className="text-xs text-on-surface-variant block font-bold">Lý do trả hàng:</span>
                  <p className="italic text-on-surface-variant mt-0.5">"{selectedReturn.reason}"</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-xs border-t border-outline/5">
                <span className="font-semibold text-on-surface">Tổng cộng hoàn tiền đợt này:</span>
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedReturn.totalRefundAmount)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-md bg-surface-container-lowest border-t border-outline/10 flex justify-end gap-sm">
              <button
                onClick={() => {
                  navigate(`/orders/${selectedReturn.originalOrderId}`);
                  setSelectedReturn(null);
                }}
                className="px-md py-sm border border-primary text-primary hover:bg-primary/5 rounded font-button text-button transition-colors"
              >
                Xem hóa đơn gốc
              </button>
              <button
                onClick={() => setSelectedReturn(null)}
                className="px-md py-sm bg-outline/20 hover:bg-outline/30 text-on-surface rounded font-button text-button transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
