import { useState } from 'react';
import { useGetStockLogsQuery, SOURCE_LABELS, SOURCE_COLORS } from '@/redux/api/stockLogApi';
import type { StockLogSource } from '@/redux/api/stockLogApi';

const fmtDate = (val?: string | null) => {
    if (!val) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(val));
};

// Tab filter theo nguồn biến động
type SourceTab = 'ALL' | StockLogSource;

const TABS: { key: SourceTab; label: string; icon: string }[] = [
    { key: 'ALL', label: 'Tất cả', icon: 'inventory_2' },
    { key: 'NHAP_HANG', label: 'Nhập hàng', icon: 'add_circle' },
    { key: 'BAN_HANG', label: 'Bán hàng', icon: 'shopping_cart' },
    { key: 'TRA_HANG', label: 'Trả hàng', icon: 'assignment_return' },
    { key: 'HUY_DON', label: 'Hủy đơn', icon: 'cancel' },
    { key: 'DIEU_CHINH', label: 'Điều chỉnh', icon: 'tune' },
];

export default function StockHistoryPage() {
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<SourceTab>('ALL');
    const size = 20;

    const queryParams = {
        page,
        size,
        sort: 'createdAt,desc',
        ...(activeTab !== 'ALL' ? { source: activeTab } : {}),
    };

    const { data, isLoading, isFetching } = useGetStockLogsQuery(queryParams);

    const logs = data?.result ?? [];
    const meta = data?.meta;
    const totalPages = meta?.pages ?? 0;

    const handleTabChange = (tab: SourceTab) => {
        setActiveTab(tab);
        setPage(1); // reset về trang 1 khi đổi tab
    };

    return (
        <div className="flex-1 px-6 pb-6 pt-2 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div>
                    <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
                        Lịch sử biến động kho
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Toàn bộ thay đổi tồn kho: nhập hàng, bán hàng, trả hàng, hủy đơn.
                    </p>
                </div>
                {meta && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-xs font-semibold text-primary shrink-0">
                        <span className="material-symbols-outlined text-[16px]">database</span>
                        <span>{meta.total.toLocaleString('vi-VN')} bản ghi</span>
                    </div>
                )}
            </div>

            {/* Source Tabs */}
            <div className="flex gap-1 p-1 bg-surface-container rounded-xl mb-6 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                            ${activeTab === tab.key
                                ? 'bg-surface text-on-surface shadow-sm'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest border border-outline/10 rounded-xl overflow-hidden relative">
                {isFetching && (
                    <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-on-surface-variant gap-2">
                        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                        <span className="text-sm">Đang tải dữ liệu...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
                        <span className="material-symbols-outlined text-5xl opacity-30">inventory_2</span>
                        <p className="text-sm">Chưa có biến động kho nào được ghi nhận.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-outline/10 bg-surface-container text-on-surface-variant">
                                <th className="text-left px-4 py-3 font-semibold">Thời gian</th>
                                <th className="text-left px-4 py-3 font-semibold">Sản phẩm / SKU</th>
                                <th className="text-center px-4 py-3 font-semibold">Nguồn</th>
                                <th className="text-center px-4 py-3 font-semibold">Trước</th>
                                <th className="text-center px-4 py-3 font-semibold">Thay đổi</th>
                                <th className="text-center px-4 py-3 font-semibold">Sau</th>
                                <th className="text-left px-4 py-3 font-semibold">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline/10">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-surface-container/50 transition-colors">
                                    <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">
                                        {fmtDate(log.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-on-surface text-sm truncate max-w-[200px]">
                                            {log.productName ?? '—'}
                                        </div>
                                        <div className="text-xs text-on-surface-variant font-mono">{log.variantSku}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${SOURCE_COLORS[log.source]}`}>
                                            {SOURCE_LABELS[log.source]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-on-surface-variant font-mono text-sm">
                                        {log.quantityBefore}
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold font-mono text-base">
                                        <span className={log.quantityChange > 0 ? 'text-emerald-600' : 'text-red-500'}>
                                            {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-semibold text-on-surface font-mono text-sm">
                                        {log.quantityAfter}
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[220px] truncate" title={log.note}>
                                        {log.note ?? '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-on-surface-variant">
                        Trang {meta?.page ?? 1} / {totalPages} &nbsp;·&nbsp; Tổng {(meta?.total ?? 0).toLocaleString('vi-VN')} bản ghi
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                                        ${page === pageNum
                                            ? 'bg-primary text-on-primary'
                                            : 'hover:bg-surface-container text-on-surface-variant'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
