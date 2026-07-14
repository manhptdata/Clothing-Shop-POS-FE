import { useState } from 'react';
import { useGetStockLogsByVariantQuery, SOURCE_LABELS, SOURCE_COLORS } from '@/redux/api/stockLogApi';

interface ProductStockHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: any; // Type it better if needed (e.g. ProductVariant)
}

const fmtDate = (val?: string | null) => {
    if (!val) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(val));
};

export default function ProductStockHistoryModal({ isOpen, onClose, variant }: ProductStockHistoryModalProps) {
    const [page, setPage] = useState(1);
    const size = 10;

    const { data, isLoading, isFetching } = useGetStockLogsByVariantQuery(
        { variantId: variant?.id, page, size },
        { skip: !isOpen || !variant?.id }
    );

    if (!isOpen) return null;

    const logs = data?.result ?? [];
    const meta = data?.meta;
    const totalPages = meta?.pages ?? 0;
    const optionNames = [variant.option1Value, variant.option2Value, variant.option3Value].filter(Boolean).join(' - ') || 'Mặc định';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-outline/10 shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-on-surface">Lịch sử tồn kho</h2>
                        <p className="text-sm text-on-surface-variant mt-1">
                            SKU: <span className="font-mono font-medium">{variant.sku}</span> • {optionNames}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
                    >
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto relative flex-1">
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
                        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3 bg-surface-container-lowest rounded-xl border border-outline/10">
                            <span className="material-symbols-outlined text-5xl opacity-30">inventory_2</span>
                            <p className="text-sm">Chưa có biến động kho nào được ghi nhận cho biến thể này.</p>
                        </div>
                    ) : (
                        <div className="bg-surface-container-lowest border border-outline/10 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-outline/10 bg-surface-container text-on-surface-variant">
                                        <th className="text-left px-4 py-3 font-semibold">Thời gian</th>
                                        <th className="text-center px-4 py-3 font-semibold">Nguồn</th>
                                        <th className="text-center px-4 py-3 font-semibold">Trước</th>
                                        <th className="text-center px-4 py-3 font-semibold">Thay đổi</th>
                                        <th className="text-center px-4 py-3 font-semibold">Sau</th>
                                        <th className="text-left px-4 py-3 font-semibold">Ghi chú</th>
                                        <th className="text-center px-4 py-3 font-semibold">Thao tác bởi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline/10">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-surface-container/50 transition-colors">
                                            <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">
                                                {fmtDate(log.createdAt)}
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
                                            <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[200px] truncate" title={log.note}>
                                                {log.note ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center text-on-surface-variant text-xs">
                                                {log.createdByUsername ?? 'Hệ thống'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer (Pagination) */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-outline/10 bg-surface-container-lowest shrink-0">
                        <div className="text-sm text-on-surface-variant">
                            Trang {meta?.page ?? 1} / {totalPages}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <span className="text-sm font-medium px-2">{page}</span>
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
        </div>
    );
}
