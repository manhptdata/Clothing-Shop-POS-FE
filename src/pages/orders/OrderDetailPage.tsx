import { Link, useParams } from 'react-router-dom';
import { 
  useGetOrderByIdQuery, 
  useCancelOrderMutation 
} from '@/redux/api/orderApi';
import { useGetCustomerByIdQuery } from '@/redux/api/customerApi';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { Badge } from '@/components/ui/Badge';

export default function OrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);

  // --- Fetch Order details ---
  const { data: orderResponse, isLoading: isOrderLoading, error } = useGetOrderByIdQuery(orderId);
  const order = orderResponse?.data;

  // --- Fetch Customer details (if available) ---
  const { data: customerResponse } = useGetCustomerByIdQuery(
    order?.customerId || 0,
    { skip: !order?.customerId }
  );
  const customer = customerResponse?.data;

  // --- Fetch all products to resolve variant details (Names, SKUs, option values) ---
  const { data: productData } = useGetProductsQuery();
  const products = productData?.data?.content || [];

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
        alert('Hủy đơn hàng thành công!');
      } catch (err: any) {
        alert(err?.data?.message || 'Không thể hủy đơn hàng này.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
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

  // --- Compute Totals ---
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08); // 8% VAT
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
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full print:max-w-none print:p-0">
      
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
              Đơn hàng {order.code}
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
          
          {order.status !== 'CANCELLED' && (
            <button 
              disabled={isCancelling}
              onClick={handleCancelOrder}
              className="px-md py-sm border border-error text-error rounded font-button text-button hover:bg-error-container/10 flex items-center gap-xs transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">undo</span>
              {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </button>
          )}
        </div>
      </div>

      {/* Details Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left: Items list (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-gutter print:w-full">
          <div className="bg-surface rounded-xl border border-outline/10 overflow-hidden">
            <div className="p-md border-b border-outline/10 bg-surface-container-low">
              <h3 className="font-title-sm text-title-sm text-on-surface">Sản phẩm trong đơn</h3>
            </div>
            <table className="w-full text-left border-collapse">
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
                  const details = getVariantDetails(item.productId);
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
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                      </td>
                      <td className="py-md px-md text-on-surface-variant text-center">{item.quantity}</td>
                      <td className="py-md px-md text-primary text-right font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
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
              <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                <span>Thuế (VAT 8%)</span>
                <span className="text-on-surface font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tax)}</span>
              </div>
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
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.customerPaid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Tiền thừa trả khách:</span>
                <span className="font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.changeAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
