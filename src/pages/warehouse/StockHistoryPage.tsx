import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useGetReceiptsQuery } from '@/redux/api/receiptApi';

const fmtDate = (val?: string | null) => {
    if (!val) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(val));
};

const fmtCurrency = (val?: number | null) => {
    if (val == null) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export default function StockHistoryPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const size = 15;

    // Lấy tất cả phiếu, sort mới nhất trước
    const { data: pageData, isLoading, isFetching } = useGetReceiptsQuery({
        page,
        size,
        sort: 'createdAt,desc',
    });

    // Chỉ hiển thị những phiếu CONFIRMED = đã thực sự thay đổi tồn kho
    const allReceipts = pageData?.content ?? [];
    const confirmedReceipts = allReceipts.filter((r) => r.status === 'CONFIRMED');
    const totalPages = pageData?.totalPages ?? 0;
    const totalElements = pageData?.totalElements ?? 0;

    return (
        <div className="max-w-[1440px] mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-md">
                <div>
                    <h2 className="font-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
                        Lịch sử thay đổi kho
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Các phiếu nhập đã được duyệt – tồn kho đã thực sự thay đổi.
                    </p>
                </div>
                {/* Info badge */}
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>Chỉ hiển thị phiếu đã duyệt (CONFIRMED)</span>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-surface rounded-xl border border-outline/10 p-4">
                    <div className="text-xs text-on-surface-variant uppercase font-semibold tracking-wide mb-1">Tổng phiếu đã duyệt</div>
                    <div className="text-2xl font-bold text-primary">{confirmedReceipts.length}</div>
                    <div className="text-xs text-on-surface-variant">trong {totalElements} phiếu tổng cộng</div>
                </div>
                <div className="bg-surface rounded-xl border border-outline/10 p-4">
                    <div className="text-xs text-on-surface-variant uppercase font-semibold tracking-wide mb-1">Tổng SL đã nhập</div>
                    <div className="text-2xl font-bold text-on-surface">
                        {confirmedReceipts.reduce((s, r) => s + (r.totalQuantity ?? 0), 0).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-xs text-on-surface-variant">sản phẩm</div>
                </div>
                <div className="bg-surface rounded-xl border border-outline/10 p-4 col-span-2 md:col-span-1">
                    <div className="text-xs text-on-surface-variant uppercase font-semibold tracking-wide mb-1">Tổng tiền đã nhập</div>
                    <div className="text-2xl font-bold text-on-surface">
                        {fmtCurrency(confirmedReceipts.reduce((s, r) => s + (r.totalAmount ?? 0), 0))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest border border-outline/10 rounded-xl overflow-hidden relative">
                {isFetching && (
                    <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-24 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                        <p className="text-body-md">Đang tải lịch sử...</p>
                    </div>
                ) : confirmedReceipts.length === 0 ? (
                    <div className="py-24 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">history</span>
                        <p className="text-body-md">Chưa có phiếu nào được duyệt.</p>
                        <p className="text-sm mt-1">Hãy tạo và duyệt phiếu nhập kho để xem lịch sử.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[750px]">
                            <thead className="bg-surface border-b border-outline/10">
                                <tr>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Mã phiếu</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">NCC ID</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right">Tổng SL nhập</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right">Tổng tiền</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Ngày tạo</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Ngày duyệt</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right w-24">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10">
                                {confirmedReceipts.map((r) => (
                                    <tr 
                                        key={r.id} 
                                        onClick={() => navigate(`/warehouse/receipts/${r.id}`)}
                                        className="hover:bg-surface-variant/20 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-6">
                                            <span className="font-mono font-semibold text-primary">{r.code}</span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-on-surface-variant">
                                            {r.supplierId ?? '—'}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="inline-flex items-center gap-1 font-semibold text-on-surface">
                                                <span className="material-symbols-outlined text-success text-[16px]">arrow_upward</span>
                                                +{r.totalQuantity ?? 0}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-semibold text-on-surface">
                                            {fmtCurrency(r.totalAmount)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-on-surface-variant">{fmtDate(r.createdAt)}</td>
                                        <td className="py-4 px-6 text-sm text-on-surface-variant">{fmtDate(r.confirmedAt)}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => navigate(`/warehouse/receipts/${r.id}`)}
                                                className="text-on-surface-variant hover:text-primary transition-colors p-1"
                                                title="Xem chi tiết"
                                            >
                                                <span className="material-symbols-outlined text-xl">open_in_new</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-outline/10 flex items-center justify-between bg-surface">
                        <span className="text-sm text-on-surface-variant">
                            Trang {page + 1}/{totalPages} · {totalElements} phiếu tổng
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}
                                leftIcon={<span className="material-symbols-outlined">chevron_left</span>}>Trước</Button>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                                rightIcon={<span className="material-symbols-outlined">chevron_right</span>}>Sau</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
