import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  useGetOrderByIdQuery, 
  useCancelOrderMutation,
  useGetReturnOrdersByOriginalOrderIdQuery,
  useCreateReturnOrderMutation
} from '@/redux/api/orderApi';
import { useGetSettingsQuery } from '@/redux/api/settingApi';
import { useGetCustomerByIdQuery } from '@/redux/api/customerApi';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { Badge } from '@/components/ui/Badge';
import { useNotifications } from '@/providers/NotificationProvider';
import { useAppSelector } from '@/redux/hooks';
import { printReceipt } from '@/utils/printReceipt';

export default function OrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === 'true';

  // --- Fetch all products to resolve variant details (Names, SKUs, option values) ---
  const { data: productData } = useGetProductsQuery();
  const products = productData?.data?.content || [];

  // --- Fetch Order details ---
  const { data: orderResponse, isLoading: isOrderLoading, error } = useGetOrderByIdQuery(orderId);
  const order = orderResponse?.data;

  // --- Fetch Customer details (if available) ---
  const { data: customerResponse } = useGetCustomerByIdQuery(
    order?.customerId || 0,
    { skip: !order?.customerId }
  );
  const customer = customerResponse?.data;

  useEffect(() => {
    if (shouldPrint && order && !isOrderLoading) {
      const timer = setTimeout(() => {
        printReceipt(order, products);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, order, isOrderLoading, products]);

  // --- Return Order State & Hooks ---
  const { data: returnOrdersResponse } = useGetReturnOrdersByOriginalOrderIdQuery(orderId, { skip: !orderId });
  const [createReturnOrder, { isLoading: isSubmittingReturn }] = useCreateReturnOrderMutation();
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || [];
  
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({});
  const [reason, setReason] = useState('');
  const [approvalPin, setApprovalPin] = useState('');

  // --- Cancellation request state ---
  const user = useAppSelector((state) => state.auth.user);
  const { sendApprovalRequest } = useNotifications();
  const [isCancelRequestModalOpen, setIsCancelRequestModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancelRequest, setIsSubmittingCancelRequest] = useState(false);

  const handleSubmitCancelRequest = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy hóa đơn');
      return;
    }
    setIsSubmittingCancelRequest(true);
    try {
      await sendApprovalRequest(order?.orderNumber || order?.code || '', cancelReason.trim());
      setIsCancelRequestModalOpen(false);
      setCancelReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCancelRequest(false);
    }
  };

  // --- Cancel Order mutation ---
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  // Helper: Find product/variant details from variant ID (productId in OrderItem)
  const getVariantDetails = (variantId: number) => {
    for (const product of products) {
      const variant = product.variants?.find(v => v.id === variantId);
      if (variant) {
        const optionStr = [
          variant.option1Value?.value,
          variant.option2Value?.value,
          variant.option3Value?.value
        ].filter(Boolean).join(' - ');

        return {
          name: product.name,
          sku: variant.sku,
          options: optionStr ? ` (${optionStr})` : '',
        };
      }
    }
    return { name: `Phân loại sản phẩm #${variantId}`, sku: 'N/A', options: '' };
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy / hoàn trả hóa đơn này không?')) {
      try {
        await cancelOrder(orderId).unwrap();
        toast.success('Hủy đơn hàng thành công!');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Không thể hủy đơn hàng này.');
      }
    }
  };

  const handlePrint = () => {
    if (order) {
      printReceipt(order, products);
    }
  };

  if (isOrderLoading) {
    return (
      <div className="py-24 text-center text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
        <p className="font-medium text-body-md">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-24 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
        <p className="font-semibold text-body-md text-error">Hóa đơn không tồn tại hoặc có lỗi xảy ra.</p>
        <Link to="/orders" className="text-primary hover:underline text-sm mt-2 inline-block">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  // --- Return Order Handlers ---
  const discountFromVoucher = order.discountFromVoucher || 0;
  const discountFromPoints = order.discountFromPoints || 0;
  const totalDiscount = discountFromVoucher + discountFromPoints;

  const originalSubtotal = order.items.reduce((sum, item) => {
    const price = item.unitPrice || (item as any).price || 0;
    return sum + price * item.quantity;
  }, 0);

  const discountRatio = originalSubtotal > 0 ? totalDiscount / originalSubtotal : 0;

  const getAlreadyReturnedQty = (variantId: number) => {
    if (!returnOrdersResponse?.data) return 0;
    return returnOrdersResponse.data.reduce((totalQty, ret) => {
      const retItem = ret.items?.find(i => i.variantId === variantId);
      return totalQty + (retItem ? retItem.quantity : 0);
    }, 0);
  };

  const handleQtyChange = (variantId: number, qty: number, maxAllowed: number) => {
    const finalQty = Math.max(0, Math.min(qty, maxAllowed));
    setReturnQuantities(prev => ({
      ...prev,
      [variantId]: finalQty
    }));
  };

  const handleSubmitReturn = async () => {
    const items = Object.entries(returnQuantities)
      .map(([variantId, qty]) => ({
        variantId: Number(variantId),
        quantity: qty
      }))
      .filter(item => item.quantity > 0);

    if (items.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để trả lại');
      return;
    }

    const requireApprovalSetting = settings?.find(s => s.settingKey === 'REQUIRE_RETURN_APPROVAL');
    const requireApproval = requireApprovalSetting ? requireApprovalSetting.settingValue === 'true' : true;
    if (requireApproval && !approvalPin) {
      toast.error('Vui lòng nhập mã PIN phê duyệt từ Quản lý / Admin');
      return;
    }

    try {
      await createReturnOrder({
        originalOrderId: Number(orderId),
        reason,
        approvalPin,
        items
      }).unwrap();
      toast.success('Tạo phiếu trả hàng thành công!');
      setIsReturnModalOpen(false);
      setReturnQuantities({});
      setReason('');
      setApprovalPin('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể tạo phiếu trả hàng này.');
    }
  };

  const orderDate = new Date(order.createdAt);
  const isReturnExpired = (new Date().getTime() - orderDate.getTime()) > (7 * 24 * 60 * 60 * 1000);

  // --- Calculate Return Refund Amount ---
  const alreadyRefundedTotal = returnOrdersResponse?.data?.reduce((sum, ret) => sum + ret.totalRefundAmount, 0) || 0;
  const remainingPaidAmount = (order?.totalAmount || 0) - alreadyRefundedTotal;
  const rawTotalRefund = Object.entries(returnQuantities).reduce((sum, [varId, qty]) => {
    const originalItem = order?.items?.find(i => (i.variantId || (i as any).productId) === Number(varId));
    if (!originalItem) return sum;
    const price = originalItem.unitPrice || (originalItem as any).price || 0;
    const refundPrice = Math.round(price * (1 - discountRatio));
    return sum + refundPrice * qty;
  }, 0);
  const totalRefund = Math.min(rawTotalRefund, remainingPaidAmount);

  // --- Compute Totals ---
  const subtotal = order.items.reduce((sum, item) => sum + (item.unitPrice || (item as any).price || 0) * item.quantity, 0);
  const tax = 0;
  const total = order.totalAmount;

  // Status mapping
  let statusBadgeVariant: 'success' | 'warning' | 'danger' | 'info' = 'info';
  let statusText = 'Đang xử lý';
  if (order.status === 'COMPLETED') {
    statusBadgeVariant = 'success';
    statusText = 'Hoàn thành';
  } else if (order.status === 'PENDING') {
    statusBadgeVariant = 'warning';
    statusText = 'Đang xử lý';
  } else if (order.status === 'CANCELLED') {
    statusBadgeVariant = 'danger';
    statusText = 'Đã hủy';
  } else if (order.status === 'RETURNED') {
    statusBadgeVariant = 'danger';
    statusText = 'Đã trả hàng';
  } else if (order.status === 'PARTIALLY_RETURNED') {
    statusBadgeVariant = 'warning';
    statusText = 'Trả hàng một phần';
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      
      {/* Back button */}
      <div className="mb-md print:hidden">
        <Link to="/orders" className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors w-max">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-body-sm text-body-sm">Quay lại danh sách đơn hàng</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-sm border-b border-outline/10 pb-md print:border-none">
        <div>
          <div className="flex items-center gap-sm mb-xs">
            <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
              Đơn hàng {order.orderNumber || order.code}
            </h2>
            <Badge variant={statusBadgeVariant}>
              {statusText}
            </Badge>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ngày lập: {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-sm print:hidden">
          <button 
            onClick={handlePrint}
            className="px-md py-sm border border-outline/30 text-on-surface rounded font-button text-button hover:bg-surface-container flex items-center gap-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            In hóa đơn
          </button>
          
          {order.status === 'PENDING' && (
            <button 
              disabled={isCancelling}
              onClick={handleCancelOrder}
              className="px-md py-sm border border-error text-error rounded font-button text-button hover:bg-error-container/10 flex items-center gap-xs transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">undo</span>
              {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </button>
          )}

          {order.status === 'COMPLETED' && (user?.role === 'ROLE_ADMIN' || (user?.permissions || []).includes('CANCEL_ORDER')) && (
            <button 
              disabled={isCancelling}
              onClick={handleCancelOrder}
              className="px-md py-sm border border-error text-error rounded font-button text-button hover:bg-error-container/10 flex items-center gap-xs transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">undo</span>
              {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </button>
          )}

          {order.status === 'COMPLETED' && !((user?.permissions || []).includes('CANCEL_ORDER')) && user?.role !== 'ROLE_ADMIN' && (user?.permissions || []).includes('CREATE_ORDER') && (
            <button 
              onClick={() => setIsCancelRequestModalOpen(true)}
              className="px-md py-sm border border-rose-500 text-rose-500 rounded font-button text-button hover:bg-rose-500/10 flex items-center gap-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">report</span>
              Yêu cầu hủy đơn
            </button>
          )}

          {(order.status === 'COMPLETED' || order.status === 'PARTIALLY_RETURNED') && (
            <button 
              disabled={isReturnExpired}
              onClick={() => setIsReturnModalOpen(true)}
              title={isReturnExpired ? "Đã quá hạn 7 ngày trả hàng" : "Trả lại sản phẩm"}
              className="px-md py-sm border border-primary text-primary rounded font-button text-button hover:bg-primary-container/10 flex items-center gap-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">assignment_return</span>
              {isReturnExpired ? 'Hết hạn trả hàng' : 'Trả hàng'}
            </button>
          )}
        </div>
      </div>

      {/* Details Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left: Items list (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-gutter print:w-full">
          <div className="bg-surface rounded-xl border border-outline/10 overflow-x-auto">
            <div className="p-md border-b border-outline/10 bg-surface-container-low min-w-[600px]">
              <h3 className="font-title-sm text-title-sm text-on-surface">Sản phẩm trong đơn</h3>
            </div>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-outline/10">
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-xs">Chi tiết sản phẩm</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-right text-xs">Đơn giá</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-center w-20 text-xs">SL</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-right text-xs">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {order.items.map((item, index) => {
                  const details = getVariantDetails(item.variantId || (item as any).productId);
                  const price = item.unitPrice || (item as any).price || 0;
                  return (
                    <tr key={index} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-md px-md">
                        <div className="flex gap-sm">
                          <div className="w-12 h-16 bg-surface-container-low border border-outline/10 rounded flex items-center justify-center flex-shrink-0 print:hidden">
                            <span className="material-symbols-outlined text-on-surface-variant/30 text-2xl">checkroom</span>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h4 className="font-title-sm text-title-sm text-on-surface font-semibold">
                              {details.name}
                              <span className="text-primary font-medium text-xs">{details.options}</span>
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">SKU: {details.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-md px-md text-on-surface text-right font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                      </td>
                      <td className="py-md px-md text-on-surface-variant text-center">{item.quantity}</td>
                      <td className="py-md px-md text-primary text-right font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Ghi chú đơn hàng nếu có */}
          {order.note && (
            <div className="bg-surface rounded-xl border border-outline/10 p-md">
              <h3 className="font-title-sm text-title-sm text-on-surface mb-xs">Ghi chú đơn hàng</h3>
              <p className="text-sm text-on-surface-variant italic">"{order.note}"</p>
            </div>
          )}

          {/* Timeline Log */}
          <div className="bg-surface rounded-xl border border-outline/10 p-md print:hidden">
            <h3 className="font-title-sm text-title-sm text-on-surface mb-md">Lịch sử giao dịch</h3>
            <div className="relative border-l-2 border-outline-variant/30 pl-6 ml-2 space-y-md">
              <div className="relative">
                <span className="absolute -left-[31px] top-1 bg-primary text-on-primary rounded-full w-4 h-4 flex items-center justify-center border-2 border-surface"></span>
                <div className="flex justify-between items-start gap-sm">
                  <div>
                    <h4 className="font-title-sm text-title-sm text-on-surface font-bold">Tạo đơn hàng</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Khởi tạo và ghi nhận thanh toán thành công tại quầy POS</p>
                  </div>
                  <span className="font-body-sm text-body-sm text-outline whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              
              {order.status === 'CANCELLED' && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 bg-error text-on-error rounded-full w-4 h-4 flex items-center justify-center border-2 border-surface"></span>
                  <div className="flex justify-between items-start gap-sm">
                    <div>
                      <h4 className="font-title-sm text-title-sm text-error font-bold">Hủy đơn hàng</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Hóa đơn đã bị hủy và hoàn kho sản phẩm tương ứng</p>
                    </div>
                  </div>
                </div>
              )}

              {returnOrdersResponse?.data?.map((ret) => (
                <div className="relative" key={ret.id}>
                  <span className="absolute -left-[31px] top-1 bg-warning text-on-warning rounded-full w-4 h-4 flex items-center justify-center border-2 border-surface"></span>
                  <div className="flex justify-between items-start gap-sm">
                    <div>
                      <h4 className="font-title-sm text-title-sm text-warning font-bold">Trả hàng ({ret.returnNumber})</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Hoàn tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ret.totalRefundAmount)}
                        {ret.reason && ` - Lý do: ${ret.reason}`}
                      </p>
                      <div className="text-[11px] text-on-surface-variant mt-1">
                        Sản phẩm trả: {ret.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                      </div>
                    </div>
                    <span className="font-body-sm text-body-sm text-outline whitespace-nowrap">
                      {new Date(ret.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Customer & Financial details (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter print:w-full">
          
          {/* Customer CRM info card */}
          <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-sm">
            <div className="flex justify-between items-center pb-sm border-b border-outline/10">
              <h3 className="font-title-sm text-title-sm text-on-surface">Thông tin khách hàng</h3>
            </div>
            
            <div className="flex gap-sm items-center py-xs">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {order.customerName ? order.customerName.substring(0, 2).toUpperCase() : 'KL'}
              </div>
              <div>
                <h4 className="font-title-sm text-title-sm text-on-surface font-bold">
                  {order.customerName || 'Khách lẻ vãng lai'}
                </h4>
                {customer && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{customer.phone}</p>
                )}
              </div>
            </div>

            {customer && customer.fullName !== 'Khách lẻ' && (
              <>
                <div className="h-px bg-outline/10 w-full"></div>
                <div className="grid grid-cols-2 gap-sm pt-xs">
                  <div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px]">Nhóm khách hàng</span>
                    <span className="font-title-sm text-title-sm text-primary block mt-0.5 font-bold">
                      {customer.groupName || 'Khách hàng thường'}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px]">Trạng thái</span>
                    <span className="font-title-sm text-title-sm text-on-surface block mt-0.5 font-bold">
                      {customer.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Financial Summary */}
          <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-sm">
            <h3 className="font-title-sm text-title-sm text-on-surface pb-sm border-b border-outline/10">Chi tiết thanh toán</h3>
            <div className="space-y-sm">
              <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                <span>Tạm tính</span>
                <span className="text-on-surface font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                  <span>Thuế (VAT 8%)</span>
                  <span className="text-on-surface font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tax)}</span>
                </div>
              )}

              {/* Vouchers discount display */}
              {order.discountFromVoucher !== undefined && Number(order.discountFromVoucher) > 0 && (
                <div className="flex justify-between items-center text-body-sm font-body-sm text-emerald-600">
                  <span>Voucher giảm giá ({order.voucherCode})</span>
                  <span className="font-semibold">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discountFromVoucher)}</span>
                </div>
              )}

              {/* Points discount display */}
              {order.discountFromPoints !== undefined && Number(order.discountFromPoints) > 0 && (
                <div className="flex justify-between items-center text-body-sm font-body-sm text-emerald-600">
                  <span>Dùng điểm ({order.pointsUsed || 0} điểm)</span>
                  <span className="font-semibold font-semibold">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discountFromPoints)}</span>
                </div>
              )}

              <div className="h-px bg-outline/10 w-full my-xs"></div>
              <div className="flex justify-between items-end">
                <span className="font-body-md text-body-md text-on-surface font-bold">Tổng cộng</span>
                <span className="font-headline-md text-headline-md text-primary font-black">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
            </div>
            
            <div className="h-px bg-outline/10 w-full my-xs"></div>
            
            <div className="space-y-xs text-sm">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Khách đã trả:</span>
                <span className="font-bold text-on-surface">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.paidAmount || (order as any).customerPaid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Tiền thừa trả khách:</span>
                <span className="font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.changeAmount)}
                </span>
              </div>
              {order.pointsEarned !== undefined && Number(order.pointsEarned) > 0 && (
                <div className="flex justify-between items-center text-xs text-[#2ecc71] font-semibold mt-2">
                  <span>Điểm tích lũy nhận được:</span>
                  <span>+{order.pointsEarned} điểm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Return Items Dialog (Modal) */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-outline/10 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-md border-b border-outline/10 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[28px]">assignment_return</span>
                Tạo phiếu trả hàng
              </h3>
              <button 
                onClick={() => setIsReturnModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-md overflow-y-auto flex-1 space-y-md">
              <div className="bg-surface-container-lowest p-sm rounded-xl border border-outline/5 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Mã hóa đơn gốc:</span>
                  <span className="font-bold text-on-surface">{order.orderNumber || order.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Khách hàng:</span>
                  <span className="font-bold text-on-surface">{order.customerName || 'Khách lẻ vãng lai'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Chiết khấu tỷ lệ áp dụng:</span>
                  <span className="font-bold text-emerald-600">{(discountRatio * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-sm">
                <h4 className="font-title-sm text-title-sm text-on-surface font-semibold">Chọn sản phẩm trả lại</h4>
                <div className="border border-outline/10 rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm min-w-[600px]">
                    <thead>
                      <tr className="bg-surface-container border-b border-outline/10">
                        <th className="py-sm px-md font-semibold text-on-surface-variant">Sản phẩm</th>
                        <th className="py-sm px-md text-right font-semibold text-on-surface-variant">Giá hoàn lại</th>
                        <th className="py-sm px-md text-center font-semibold text-on-surface-variant">Có thể trả</th>
                        <th className="py-sm px-md text-center w-28 font-semibold text-on-surface-variant">SL trả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/5">
                      {order.items.map((item) => {
                        const variantId = item.variantId || (item as any).productId;
                        const details = getVariantDetails(variantId);
                        const price = item.unitPrice || (item as any).price || 0;
                        const refundPrice = Math.round(price * (1 - discountRatio));
                        const alreadyReturned = getAlreadyReturnedQty(variantId);
                        const maxAllowed = item.quantity - alreadyReturned;

                        if (maxAllowed <= 0) return null;

                        return (
                          <tr key={variantId} className="hover:bg-surface-container-lowest/50">
                            <td className="py-sm px-md">
                              <span className="font-semibold block">{details.name}</span>
                              <span className="text-xs text-on-surface-variant">SKU: {details.sku}</span>
                            </td>
                            <td className="py-sm px-md text-right font-medium">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundPrice)}
                            </td>
                            <td className="py-sm px-md text-center text-on-surface-variant">
                              {maxAllowed} / {item.quantity}
                            </td>
                            <td className="py-sm px-md">
                              <div className="flex items-center justify-center gap-xs">
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(variantId, (returnQuantities[variantId] || 0) - 1, maxAllowed)}
                                  className="w-7 h-7 rounded border border-outline/30 flex items-center justify-center hover:bg-surface-container active:bg-surface-container-high transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  max={maxAllowed}
                                  value={returnQuantities[variantId] || 0}
                                  onChange={(e) => handleQtyChange(variantId, parseInt(e.target.value) || 0, maxAllowed)}
                                  className="w-12 text-center border-b border-outline/30 bg-transparent py-0.5 focus:border-primary focus:outline-none text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(variantId, (returnQuantities[variantId] || 0) + 1, maxAllowed)}
                                  className="w-7 h-7 rounded border border-outline/30 flex items-center justify-center hover:bg-surface-container active:bg-surface-container-high transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {order.items.every(i => getAlreadyReturnedQty(i.variantId || (i as any).productId) === i.quantity) && (
                        <tr>
                          <td colSpan={4} className="py-md text-center text-on-surface-variant italic">
                            Tất cả sản phẩm đã được trả lại hoàn toàn.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reason input */}
              <div className="flex flex-col gap-xs">
                <label className="text-sm font-semibold text-on-surface-variant">Lý do trả hàng</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do trả hàng..."
                  rows={3}
                  className="w-full px-sm py-xs border border-outline/30 rounded-xl bg-transparent text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 text-on-surface"
                />
              </div>

              {/* PIN input if required */}
              {(!settings?.find(s => s.settingKey === 'REQUIRE_RETURN_APPROVAL') || settings?.find(s => s.settingKey === 'REQUIRE_RETURN_APPROVAL')?.settingValue === 'true') && (
                <div className="flex flex-col gap-xs mt-2 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <label className="text-sm font-semibold text-rose-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Mã PIN Phê Duyệt Trả Hàng (Quản lý)
                  </label>
                  <input
                    type="password"
                    value={approvalPin}
                    onChange={(e) => setApprovalPin(e.target.value)}
                    placeholder="Yêu cầu Quản lý/Admin nhập mã PIN..."
                    className="w-full px-sm py-xs border border-rose-300 rounded-lg bg-white text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/20 text-on-surface"
                  />
                  <p className="text-[11px] text-rose-500 mt-1 mb-0 italic">
                    * Bắt buộc: Quản lý hoặc Admin có thể tạo mã PIN này trong menu tài khoản.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-md border-t border-outline/10 bg-surface-container-lowest flex justify-between items-center">
              <div>
                <span className="text-xs text-on-surface-variant block">Tổng cộng hoàn tiền</span>
                <span className="text-xl font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRefund)}
                </span>
              </div>
              <div className="flex gap-sm">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-md py-sm border border-outline/30 rounded font-button text-button hover:bg-surface-container text-on-surface transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isSubmittingReturn || totalRefund <= 0}
                  onClick={handleSubmitReturn}
                  className="px-md py-sm bg-primary text-on-primary rounded font-button text-button hover:bg-primary-hover active:bg-primary-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-xs"
                >
                  {isSubmittingReturn ? 'Đang xử lý...' : 'Xác nhận trả'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Dialog (Modal) */}
      {isCancelRequestModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-outline/10 max-w-md w-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-md border-b border-outline/10 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-rose-500 text-[28px]">report</span>
                Yêu cầu hủy hóa đơn
              </h3>
              <button 
                onClick={() => setIsCancelRequestModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-md space-y-md">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Yêu cầu hủy hóa đơn này sẽ được gửi tới Admin/Quản lý để phê duyệt theo thời gian thực.
              </p>
              <div className="flex flex-col gap-xs">
                <label className="text-xs font-semibold text-on-surface-variant">Lý do hủy đơn hàng</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy hóa đơn (ví dụ: Khách muốn đổi sản phẩm khác, thối nhầm tiền...)"
                  rows={3}
                  className="w-full p-3 border border-outline/30 rounded-xl bg-transparent text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 text-on-surface resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-md border-t border-outline/10 bg-surface-container-lowest flex justify-end gap-sm">
              <button
                type="button"
                onClick={() => setIsCancelRequestModalOpen(false)}
                className="px-md py-sm border border-outline/30 rounded font-button text-button hover:bg-surface-container text-on-surface transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmittingCancelRequest}
                onClick={handleSubmitCancelRequest}
                className="px-md py-sm bg-rose-500 text-white rounded font-button text-button hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {isSubmittingCancelRequest ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
