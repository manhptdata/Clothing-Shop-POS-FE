import { Link, useParams } from 'react-router-dom';

const mockOrdersDetail: Record<string, {
  id: string;
  date: string;
  status: string;
  statusClass: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerInitials: string;
  customerTier: string;
  customerPoints: string;
  handledBy: string;
  items: Array<{ name: string; sku: string; price: string; qty: number; subtotal: string }>;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentMethod: string;
  paymentStatus: string;
  timeline: Array<{ time: string; event: string; desc: string }>;
}> = {
  '90': {
    id: '#ORD-0091',
    date: 'Hôm nay, 10:22 SA',
    status: 'Hoàn thành',
    statusClass: 'bg-primary-fixed/30 text-primary-container',
    customerName: 'Eleanor Vance',
    customerEmail: 'e.vance@example.com',
    customerPhone: '+33 6 12 34 56 78',
    customerInitials: 'EV',
    customerTier: 'VÀNG',
    customerPoints: '2,850',
    handledBy: 'Julian Vance (Nhân viên bán hàng)',
    items: [
      { name: 'Khăn lụa - Emerald', sku: 'ACC-SLK-EMR', price: '€350', qty: 1, subtotal: '€350' }
    ],
    subtotal: '€350',
    discount: '€0',
    tax: '€70',
    total: '€420',
    paymentMethod: 'Visa đuôi 4242',
    paymentStatus: 'Đã thanh toán',
    timeline: [
      { time: '10:22 SA', event: 'Đã nhận thanh toán', desc: 'Giao dịch được chấp thuận qua Terminal 2' },
      { time: '10:21 SA', event: 'Tạo đơn hàng', desc: 'Đã quét mã sản phẩm và bắt đầu thanh toán' }
    ]
  },
  '91': {
    id: '#ORD-0092',
    date: 'Hôm nay, 09:48 SA',
    status: 'Đang xử lý',
    statusClass: 'bg-secondary-container/50 text-on-secondary-container',
    customerName: 'Arthur Pendelton',
    customerEmail: 'a.pendelton@example.com',
    customerPhone: '+44 7700 900077',
    customerInitials: 'AP',
    customerTier: 'BẠC',
    customerPoints: '1,200',
    handledBy: 'Clara Moreau (Quản lý cửa hàng)',
    items: [
      { name: 'Cặp da', sku: 'ACC-LTH-BRF', price: '€1,200', qty: 1, subtotal: '€1,200' }
    ],
    subtotal: '€1,200',
    discount: '€0',
    tax: '€240',
    total: '€1,440',
    paymentMethod: 'Chuyển khoản',
    paymentStatus: 'Đang chờ xử lý',
    timeline: [
      { time: '09:48 SA', event: 'Tạo hóa đơn', desc: 'Đã gửi hóa đơn qua email cho khách hàng' },
      { time: '09:45 SA', event: 'Đặt hàng thành công', desc: 'Khách hàng yêu cầu thanh toán chuyển khoản' }
    ]
  },
  '92': {
    id: '#ORD-0093',
    date: 'Hôm nay, 09:15 SA',
    status: 'Đặt trước VIP',
    statusClass: 'bg-[#D4AF37]/20 text-[#574500]',
    customerName: 'Sophia Lauren',
    customerEmail: 's.lauren@example.com',
    customerPhone: '+33 6 98 76 54 32',
    customerInitials: 'SL',
    customerTier: 'VÀNG',
    customerPoints: '4,520',
    handledBy: 'Julian Vance (Nhân viên bán hàng)',
    items: [
      { name: 'Áo khoác Cashmere', sku: 'OUT-CSH-COT', price: '€2,850', qty: 1, subtotal: '€2,850' }
    ],
    subtotal: '€2,850',
    discount: '€285 (Giảm 10% Thành viên Vàng)',
    tax: '€513',
    total: '€3,078',
    paymentMethod: 'Tài khoản đặc biệt',
    paymentStatus: 'Đã xác thực',
    timeline: [
      { time: '09:15 SA', event: 'Duyệt đặt trước', desc: 'Thứ tự ưu tiên xử lý: Mức 1' },
      { time: '09:10 SA', event: 'Yêu cầu VIP được gửi', desc: 'Lấy từ bộ sưu tập Mùa Thu Paris' }
    ]
  }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const details = mockOrdersDetail[id || '90'] || mockOrdersDetail['90'];

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      {/* Nút quay lại */}
      <div className="mb-md">
        <Link to="/orders" className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors w-max">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-body-sm text-body-sm">Quay lại danh sách đơn hàng</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-sm border-b border-outline/10 pb-md">
        <div>
          <div className="flex items-center gap-sm mb-xs">
            <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
              {details.id}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${details.statusClass}`}>
              {details.status}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Ngày đặt: {details.date} • Phụ trách bởi {details.handledBy}</p>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm border border-outline/30 text-on-surface rounded font-button text-button hover:bg-surface-container flex items-center gap-xs transition-colors">
            <span className="material-symbols-outlined text-[18px]">print</span>
            In hóa đơn
          </button>
          <button className="px-md py-sm border border-error text-error rounded font-button text-button hover:bg-error-container/10 flex items-center gap-xs transition-colors">
            <span className="material-symbols-outlined text-[18px]">undo</span>
            Hoàn trả / Hủy đơn
          </button>
        </div>
      </div>

      {/* Details Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Items list (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <div className="bg-surface rounded-xl border border-outline/10 overflow-hidden">
            <div className="p-md border-b border-outline/10 bg-surface-container-low">
              <h3 className="font-title-sm text-title-sm text-on-surface">Sản phẩm trong đơn</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-outline/10">
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase">Chi tiết sản phẩm</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Đơn giá</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-center w-20">SL</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {details.items.map((item) => (
                  <tr key={item.sku} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="py-md px-md">
                      <div className="flex gap-sm">
                        <div className="w-16 h-20 bg-surface-container-low border border-outline/10 rounded flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-on-surface-variant/30 text-3xl">checkroom</span>
                        </div>
                        <div className="flex flex-col justify-between py-1">
                          <h4 className="font-title-sm text-title-sm text-on-surface">{item.name}</h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">SKU: {item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-md px-md text-on-surface text-right font-medium">{item.price}</td>
                    <td className="py-md px-md text-on-surface-variant text-center">{item.qty}</td>
                    <td className="py-md px-md text-primary text-right font-medium">{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Status Timeline log */}
          <div className="bg-surface rounded-xl border border-outline/10 p-md">
            <h3 className="font-title-sm text-title-sm text-on-surface mb-md">Lịch sử giao dịch</h3>
            <div className="relative border-l-2 border-outline-variant/30 pl-6 ml-2 space-y-md">
              {details.timeline.map((log, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-[31px] top-1 bg-surface border-2 border-primary rounded-full w-4 h-4 flex items-center justify-center"></span>
                  <div className="flex justify-between items-start gap-sm">
                    <div>
                      <h4 className="font-title-sm text-title-sm text-on-surface">{log.event}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{log.desc}</p>
                    </div>
                    <span className="font-body-sm text-body-sm text-outline whitespace-nowrap">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Customer & Financial details (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Customer CRM info card */}
          <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-sm">
            <div className="flex justify-between items-center pb-sm border-b border-outline/10">
              <h3 className="font-title-sm text-title-sm text-on-surface">Hồ sơ khách hàng</h3>
              <Link to={`/customers/${details.customerInitials === 'EV' ? '1' : details.customerInitials === 'AP' ? '2' : '3'}/edit`} className="text-primary hover:text-primary-container transition-colors text-xs font-button flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">edit</span> Sửa CRM
              </Link>
            </div>
            <div className="flex gap-sm items-center py-xs">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-title-sm text-primary">
                {details.customerInitials}
              </div>
              <div>
                <h4 className="font-title-sm text-title-sm text-on-surface">{details.customerName}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{details.customerEmail}</p>
              </div>
            </div>
            <div className="h-px bg-outline/10 w-full"></div>
            <div className="grid grid-cols-2 gap-sm pt-xs">
              <div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Hạng thẻ</span>
                <span className="font-title-sm text-title-sm text-secondary-container block mt-0.5">{details.customerTier}</span>
              </div>
              <div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Điểm tích lũy</span>
                <span className="font-title-sm text-title-sm text-on-surface block mt-0.5">{details.customerPoints} pts</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-sm">
            <h3 className="font-title-sm text-title-sm text-on-surface pb-sm border-b border-outline/10">Tổng kết thanh toán</h3>
            <div className="space-y-sm">
              <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                <span>Tạm tính</span>
                <span className="text-on-surface">{details.subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                <span>Giảm giá</span>
                <span className="text-error">{details.discount}</span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                <span>Thuế (VAT 20%)</span>
                <span className="text-on-surface">{details.tax}</span>
              </div>
              <div className="h-px bg-outline/10 w-full my-xs"></div>
              <div className="flex justify-between items-end">
                <span className="font-body-md text-body-md text-on-surface font-semibold">Tổng cộng</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">{details.total}</span>
              </div>
            </div>
            <div className="h-px bg-outline/10 w-full my-xs"></div>
            <div className="space-y-xs">
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-on-surface-variant">Phương thức:</span>
                <span className="font-medium text-on-surface">{details.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-on-surface-variant">Trạng thái:</span>
                <span className="font-medium text-primary-container">{details.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
