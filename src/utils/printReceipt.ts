import type { Order } from '@/types/order.types';
import type { Product } from '@/types/product.types';

function fmt(amount: number) {
  return amount.toLocaleString('en-US') + 'đ';
}

function getVariantDetails(variantId: number, products: Product[]) {
  for (const product of products) {
    const variant = product.variants?.find((v) => v.id === variantId);
    if (variant) {
      const optionStr = [variant.option1Value?.value, variant.option2Value?.value, variant.option3Value?.value]
        .filter(Boolean).join(' / ');
      return { name: product.name, sku: variant.sku || '', options: optionStr };
    }
  }
  return { name: `Sản phẩm #${variantId}`, sku: 'N/A', options: '' };
}

export function printReceipt(order: Order, products: Product[]) {
  const subtotal = order.items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
  const discountFromVoucher = order.discountFromVoucher || 0;
  const discountFromPoints = order.discountFromPoints || 0;
  const paidAmount = order.paidAmount || 0;
  const changeAmount = order.changeAmount || 0;
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const printDate = new Date(order.createdAt);

  const paymentMethodText = order.paymentMethod === 'QR_PAYOS' ? 'Chuyển khoản' : 'Tiền mặt';

  const itemsHTML = order.items.map((item) => {
    const d = getVariantDetails(item.variantId || (item as any).productId, products);
    const price = item.unitPrice || (item as any).price || 0;
    const optionStr = d.options ? ` (${d.options})` : '';
    return `
      <div style="margin-bottom: 6px; font-size: 11.5px;">
        <div style="margin-bottom: 2px;">${d.name}${optionStr}</div>
        <div style="display: flex; justify-content: space-between;">
          <span style="width: 15%; text-align: left;">${item.quantity}</span>
          <span style="width: 50%; text-align: right; padding-right: 15px;">${fmt(price)}</span>
          <span style="width: 35%; text-align: right;">${fmt(price * item.quantity)}</span>
        </div>
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8">
<title>Hóa đơn ${order.orderNumber || '#' + order.id}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11.5px;
    color: #000;
    width: 72mm;
    margin: 0 auto;
    padding: 10px 4px;
    line-height: 1.4;
  }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .divider-solid { border-top: 1px solid #000; margin: 6px 0; }
  .divider-dashed { border-top: 1px dashed #000; margin: 8px 0; }
  .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
  .row-bold { display: flex; justify-content: space-between; margin-bottom: 3px; font-weight: bold; }
</style></head><body>
<div class="center" style="margin-bottom:10px">
  <div style="font-size:12px;margin-bottom:2px">84971526915</div>
  <div style="font-size:15px;font-weight:bold;margin-bottom:2px;letter-spacing:0.5px">HÓA ĐƠN BÁN HÀNG</div>
  <div style="font-size:12px">#${order.orderNumber || order.code || order.id}</div>
</div>
<div style="font-size:11.5px;margin-bottom:8px;line-height:1.5">
  <div>Ngày bán: ${printDate.toLocaleDateString('vi-VN')} ${printDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
  <div>NV: ${order.createdByUsername || 'N/A'}</div>
  <div>KH: ${order.customerName || ''}</div>
</div>
<div class="divider-solid"></div>
<div style="display:flex;justify-content:space-between;font-weight:bold;font-size:11.5px;padding:2px 0">
  <span style="width:15%;text-align:left">SL</span>
  <span style="width:50%;text-align:right;padding-right:15px">ĐG</span>
  <span style="width:35%;text-align:right">T. Tiền</span>
</div>
<div class="divider-solid"></div>
<div style="margin-bottom:6px">
  ${itemsHTML}
</div>
<div class="divider-solid"></div>
<div style="font-size:11.5px;line-height:1.55">
  <div class="row">
    <span>Tổng số lượng</span>
    <span>${totalQuantity}</span>
  </div>
  <div class="row">
    <span>Tổng tiền hàng (Đã trừ GGSP)</span>
    <span>${fmt(subtotal)}</span>
  </div>
  <div class="row">
    <span>Giảm giá đơn hàng</span>
    <span>${fmt(discountFromVoucher + discountFromPoints)}</span>
  </div>
  <div class="row-bold" style="font-size:13px;margin:4px 0">
    <span>Khách phải trả</span>
    <span>${fmt(order.totalAmount)}</span>
  </div>
  <div class="row">
    <span>Tiền khách đưa</span>
    <span>${fmt(paidAmount)}</span>
  </div>
  <div class="row">
    <span>${paymentMethodText}</span>
    <span>${fmt(paidAmount)}</span>
  </div>
  ${changeAmount > 0 ? `
  <div class="row-bold">
    <span>Tiền thừa trả khách</span>
    <span>${fmt(changeAmount)}</span>
  </div>` : ''}
</div>
<div class="divider-dashed"></div>
<div class="center" style="font-size:10.5px;font-style:italic;line-height:1.4;padding:0 5px">
  Quý khách vui lòng kiểm tra hóa đơn và hàng hóa trước khi ra khỏi cửa hàng
</div>
<div class="divider-dashed"></div>
<div class="center bold" style="font-size:12px;letter-spacing:0.5px">
  CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI
</div>
</body></html>`;

  // Dùng iframe ẩn: không bị popup blocker chặn, đợi onload rồi mới print
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.left = '-9999px';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) { document.body.removeChild(iframe); return; }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Xóa iframe sau khi print dialog đóng
      setTimeout(() => { document.body.removeChild(iframe); }, 1000);
    }, 200);
  };
}
