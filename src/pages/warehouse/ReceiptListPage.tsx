import { useState, useEffect } from 'react';
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

import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

export default function ReceiptListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const size = 10;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: pageData, isLoading, isFetching } = useGetReceiptsQuery({ 
        page, 
        size, 
        sort: 'createdAt,desc',
        ...(status ? { status } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {})
    });
    const receipts = pageData?.content ?? [];
    const totalPages = pageData?.totalPages ?? 0;
    const totalElements = pageData?.totalElements ?? 0;


    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'DRAFT', label: 'Nháp' },
        { value: 'CONFIRMED', label: 'Đã duyệt' },
        { value: 'CANCELLED', label: 'Đã hủy' }
    ];

    return (
        <div className="flex-1 px-6 pb-6 pt-2 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-md">
                <div>
                    <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
                        Phiếu nhập kho
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Quản lý việc nhập hàng vào kho từ nhà cung cấp.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/warehouse/receipts/new')}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
                >
                    Tạo phiếu nhập
                </Button>
            </div>

            {/* TÌM KIẾM & BỘ LỌC */}
            <div className="bg-surface rounded-xl border border-outline/10 p-4 flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc ghi chú..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-body-sm text-body-sm transition-all"
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(0); // Reset page on filter
                        }}
                        className="w-full pl-4 pr-10 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-body-sm text-body-sm appearance-none cursor-pointer transition-all"
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">filter_list</span>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline/10 rounded-xl overflow-hidden relative">
                {isFetching && (
                    <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
                    </div>
                )}
                {isLoading ? (
                    <div className="py-24 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                        <p className="text-body-md">Đang tải dữ liệu...</p>
                    </div>
                ) : receipts.length === 0 ? (
                    <div className="py-24 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">inbox</span>
                        <p className="text-body-md">Chưa có phiếu nhập nào.</p>
                        <Button
                            className="mt-4"
                            size="sm"
                            onClick={() => navigate('/warehouse/receipts/new')}
                            leftIcon={<span className="material-symbols-outlined text-[16px]">add</span>}
                        >
                            Tạo phiếu nhập đầu tiên
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[750px]">
                            <thead className="bg-surface border-b border-outline/10">
                                <tr>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Mã phiếu</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-center">Trạng thái</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right">Tổng SL</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right">Tổng tiền</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Ngày tạo</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10">
                                {receipts.map((r) => (
                                    <tr 
                                        key={r.id} 
                                        onClick={() => navigate(`/warehouse/receipts/${r.id}`)}
                                        className="hover:bg-surface-variant/20 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-6">
                                            <span className="font-mono font-semibold text-primary">{r.code}</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {r.status === 'DRAFT' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-container text-on-warning-container">
                                                    <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                                    Nháp
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-container text-on-success-container">
                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                    Đã duyệt
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-on-surface">{r.totalQuantity ?? 0}</td>
                                        <td className="py-4 px-6 text-right font-semibold text-on-surface">{fmtCurrency(r.totalAmount)}</td>
                                        <td className="py-4 px-6 text-sm text-on-surface-variant">{fmtDate(r.createdAt)}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => navigate(`/warehouse/receipts/${r.id}`)}
                                                className="text-on-surface-variant hover:text-primary transition-colors p-1"
                                                title="Xem chi tiết"
                                            >
                                                <span className="material-symbols-outlined text-xl">visibility</span>
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
                            {(page * size) + 1}–{Math.min((page + 1) * size, totalElements)} / {totalElements} phiếu
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}
                                leftIcon={<span className="material-symbols-outlined">chevron_left</span>}>Trước</Button>
                            <span className="text-sm font-medium px-2">Trang {page + 1}/{totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                                rightIcon={<span className="material-symbols-outlined">chevron_right</span>}>Sau</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
