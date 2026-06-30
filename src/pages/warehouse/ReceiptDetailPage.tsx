import { useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useGetReceiptByIdQuery, useConfirmReceiptMutation, useCancelReceiptMutation } from '@/redux/api/receiptApi';

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

export default function ReceiptDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const { data: receipt, isLoading, isError } = useGetReceiptByIdQuery(Number(id));
    const [confirmReceipt, { isLoading: isConfirming }] = useConfirmReceiptMutation();
    const [cancelReceipt, { isLoading: isCancelling }] = useCancelReceiptMutation();

    const handleConfirm = async () => {
        if (!receipt) return;
        try {
            await confirmReceipt(receipt.id).unwrap();
            setShowConfirmModal(false);
            toast.success('Duyệt phiếu thành công! Tồn kho đã được cập nhật.');
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || 'Lỗi khi duyệt phiếu');
        }
    };

    const handleCancel = async () => {
        if (!receipt) return;
        try {
            await cancelReceipt(receipt.id).unwrap();
            setShowCancelModal(false);
            toast.success('Hủy phiếu thành công! Tồn kho và giá vốn đã được khôi phục.');
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || 'Lỗi khi hủy phiếu');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
            </div>
        );
    }

    if (isError || !receipt) {
        return (
            <div className="text-center py-32">
                <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
                <p className="text-on-surface-variant">Không tìm thấy phiếu nhập.</p>
                <Button className="mt-4" variant="outline" onClick={() => navigate('/warehouse/receipts')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    const isDraft = receipt.status === 'DRAFT';
    const isConfirmed = receipt.status === 'CONFIRMED';
    const isCancelled = receipt.status === 'CANCELLED';

    return (
        <div className="max-w-[1000px] mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/warehouse/receipts')}
                        className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-variant/30"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-on-surface" style={{ fontSize: '24px' }}>
                                Chi tiết phiếu nhập
                            </h2>
                            <span className="font-mono font-semibold text-primary text-lg">{receipt.code}</span>
                            {isDraft ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-container text-on-warning-container">
                                    <span className="material-symbols-outlined text-[13px]">edit_note</span> Nháp
                                </span>
                            ) : isConfirmed ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-container text-on-success-container">
                                    <span className="material-symbols-outlined text-[13px]">check_circle</span> Đã duyệt
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
                                    <span className="material-symbols-outlined text-[13px]">cancel</span> Đã hủy
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-on-surface-variant mt-1">Ngày tạo: {fmtDate(receipt.createdAt)}</p>
                    </div>
                </div>

                {!isCancelled && (
                    <div className="flex items-center gap-3">
                        {isDraft && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/warehouse/receipts/${receipt.id}/edit`)}
                                    leftIcon={<span className="material-symbols-outlined text-[18px]">edit</span>}
                                >
                                    Sửa phiếu
                                </Button>
                                <Button
                                    onClick={() => setShowConfirmModal(true)}
                                    leftIcon={<span className="material-symbols-outlined text-[18px]">verified</span>}
                                >
                                    Duyệt phiếu nhập
                                </Button>
                            </>
                        )}
                        {isConfirmed && (
                            <Button
                                variant="outline"
                                onClick={() => setShowCancelModal(true)}
                                className="border-error hover:bg-error/10 text-error"
                                leftIcon={<span className="material-symbols-outlined text-[18px]">cancel</span>}
                            >
                                Hủy phiếu
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'NCC ID', value: receipt.supplierId ?? '—', icon: 'local_shipping' },
                    { label: 'Tổng số lượng', value: receipt.totalQuantity ?? 0, icon: 'inventory_2' },
                    { label: 'Tổng tiền', value: fmtCurrency(receipt.totalAmount), icon: 'payments' },
                    { label: 'Ngày duyệt', value: fmtDate(receipt.confirmedAt), icon: 'event_available' },
                ].map((info) => (
                    <div key={info.label} className="bg-surface rounded-xl border border-outline/10 p-4">
                        <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                            <span className="material-symbols-outlined text-[16px]">{info.icon}</span>
                            <span className="text-xs uppercase font-semibold tracking-wide">{info.label}</span>
                        </div>
                        <div className="font-bold text-on-surface text-lg">{info.value}</div>
                    </div>
                ))}
            </div>

            {/* Note */}
            {receipt.note && (
                <div className="bg-surface border border-outline/10 rounded-xl p-4 mb-6 flex gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">notes</span>
                    <div>
                        <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Ghi chú</p>
                        <p className="text-sm text-on-surface">{receipt.note}</p>
                    </div>
                </div>
            )}

            {/* Items table */}
            <div className="bg-surface-container-lowest border border-outline/10 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-outline/10 bg-surface">
                    <h3 className="font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
                        Danh sách sản phẩm ({receipt.items?.length ?? 0} dòng)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead className="bg-surface border-b border-outline/10">
                            <tr>
                                <th className="font-label-caps text-label-caps text-on-surface-variant py-3 px-5 font-semibold">#</th>
                                <th className="font-label-caps text-label-caps text-on-surface-variant py-3 px-5 font-semibold">SKU</th>
                                <th className="font-label-caps text-label-caps text-on-surface-variant py-3 px-5 font-semibold text-right">Số lượng</th>
                                <th className="font-label-caps text-label-caps text-on-surface-variant py-3 px-5 font-semibold text-right">Giá nhập</th>
                                <th className="font-label-caps text-label-caps text-on-surface-variant py-3 px-5 font-semibold text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline/10">
                            {(receipt.items ?? []).map((item, idx) => (
                                <tr key={item.id} className="hover:bg-surface-variant/10 transition-colors">
                                    <td className="py-3 px-5 text-sm text-on-surface-variant">{idx + 1}</td>
                                    <td className="py-3 px-5">
                                        <span className="font-mono text-sm font-semibold text-on-surface">{item.sku}</span>
                                        <span className="block text-xs text-on-surface-variant">Variant ID: {item.variantId}</span>
                                    </td>
                                    <td className="py-3 px-5 text-right font-medium">{item.quantity}</td>
                                    <td className="py-3 px-5 text-right text-sm">{fmtCurrency(item.importPrice)}</td>
                                    <td className="py-3 px-5 text-right font-semibold text-on-surface">
                                        {item.importPrice != null
                                            ? fmtCurrency(item.quantity * item.importPrice)
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-outline/10 bg-surface">
                                <td colSpan={3} className="py-4 px-5 text-sm font-semibold text-on-surface">
                                    Tổng cộng: {receipt.totalQuantity} sản phẩm
                                </td>
                                <td className="py-4 px-5 text-right text-sm text-on-surface-variant font-semibold">Tổng:</td>
                                <td className="py-4 px-5 text-right font-bold text-primary text-base">
                                    {fmtCurrency(receipt.totalAmount)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative bg-surface rounded-2xl w-full max-w-md shadow-xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                            <h3 className="text-lg font-bold text-on-surface">Xác nhận duyệt phiếu</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-2">
                            Bạn sắp duyệt phiếu <span className="font-mono font-bold text-primary">{receipt.code}</span>.
                        </p>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-5">
                            <p className="text-sm font-medium text-on-surface">
                                Tổng <span className="text-primary font-bold">{receipt.totalQuantity}</span> sản phẩm sẽ được
                                cộng vào tồn kho ngay sau khi duyệt.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isConfirming}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                isLoading={isConfirming}
                                disabled={isConfirming}
                                leftIcon={<span className="material-symbols-outlined text-[18px]">check</span>}
                            >
                                Xác nhận duyệt
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
                    <div className="relative bg-surface rounded-2xl w-full max-w-md shadow-xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-error text-3xl">cancel</span>
                            <h3 className="text-lg font-bold text-on-surface">Xác nhận hủy phiếu</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-2">
                            Bạn sắp hủy phiếu nhập <span className="font-mono font-bold text-primary">{receipt.code}</span>.
                        </p>
                        <div className="bg-error/5 border border-error/20 rounded-lg p-3 mb-5">
                            <p className="text-sm font-medium text-on-surface">
                                Hệ thống sẽ trừ lại tồn kho các sản phẩm đã nhập từ phiếu này và khôi phục giá vốn bình quân về trạng thái trước đó. <span className="text-error font-semibold">Hành động này không thể hoàn tác.</span>
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>
                                Đóng
                            </Button>
                            <Button
                                className="bg-error hover:bg-error/90 text-on-error"
                                onClick={handleCancel}
                                isLoading={isCancelling}
                                disabled={isCancelling}
                                leftIcon={<span className="material-symbols-outlined text-[18px]">check</span>}
                            >
                                Xác nhận hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
