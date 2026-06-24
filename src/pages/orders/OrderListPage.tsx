import { Link } from 'react-router-dom';

const orders = [
  { id: '#ORD-0091', customer: 'Eleanor Vance', product: 'Khăn lụa - Xanh ngọc', amount: '€350', date: 'Hôm nay, 10:22 SA', status: 'Hoàn thành', statusClass: 'bg-primary-fixed/30 text-primary-container' },
  { id: '#ORD-0092', customer: 'Arthur Pendelton', product: 'Cặp da', amount: '€1,200', date: 'Hôm nay, 09:48 SA', status: 'Đang xử lý', statusClass: 'bg-secondary-container/50 text-on-secondary-container' },
  { id: '#ORD-0093', customer: 'Sophia Lauren', product: 'Áo khoác len Cashmere', amount: '€2,850', date: 'Hôm nay, 09:15 SA', status: 'Đặt trước VIP', statusClass: 'bg-[#D4AF37]/20 text-[#574500]' },
  { id: '#ORD-0094', customer: 'Marcus Reed', product: 'Khuy măng sét bạc', amount: '€420', date: 'Hôm qua, 18:30 CH', status: 'Hoàn thành', statusClass: 'bg-primary-fixed/30 text-primary-container' },
  { id: '#ORD-0095', customer: 'Clara Dubois', product: 'Áo lụa xếp ly', amount: '€890', date: 'Hôm qua, 17:05 CH', status: 'Đang xử lý', statusClass: 'bg-secondary-container/50 text-on-secondary-container' },
  { id: '#ORD-0090', customer: 'Julian Blackwood', product: 'Áo khoác len Trench', amount: '€2,450', date: 'Hôm qua, 14:20 CH', status: 'Đã hủy', statusClass: 'bg-error-container text-on-error-container' },
];

export default function OrderListPage() {
  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>Đơn hàng</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Quản lý tất cả giao dịch và lịch sử đơn hàng.</p>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm border border-primary text-primary rounded font-button text-button hover:bg-primary/5 flex items-center gap-xs transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Lọc
          </button>
          <Link
            to="/orders/new"
            className="px-md py-sm bg-primary-container text-on-primary rounded font-button text-button hover:opacity-90 flex items-center gap-xs transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tạo đơn mới
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Đơn hàng hôm nay", value: '48', icon: 'local_mall', trend: '+6 so với hôm qua', up: true },
          { label: 'Doanh thu hôm nay', value: '€14,250', icon: 'payments', trend: '+12.5% so với hôm qua', up: true },
          { label: 'Đang xử lý', value: '12', icon: 'hourglass_top', trend: 'Chờ chuẩn bị hàng', up: null },
          { label: 'Hoàn thành', value: '36', icon: 'check_circle', trend: '75% tỷ lệ hoàn thành', up: true },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-xl border border-outline/10 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{s.label}</span>
              <span className="material-symbols-outlined text-primary-container">{s.icon}</span>
            </div>
            <div className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>{s.value}</div>
            <div className={`flex items-center gap-2 font-body-sm text-body-sm ${s.up === null ? 'text-on-surface-variant' : 'text-primary-container'}`}>
              {s.up !== null && <span className="material-symbols-outlined text-sm">{s.up ? 'trending_up' : 'trending_down'}</span>}
              <span>{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-sm mb-md border-b border-outline/10 pb-sm">
        {['Tất cả', 'Đang xử lý', 'Hoàn thành', 'Đã hủy', 'VIP Đặt trước'].map((tab, i) => (
          <button
            key={tab}
            className={`font-button text-button px-4 py-2 rounded-lg transition-colors ${i === 0 ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-surface rounded-xl border border-outline/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/10 bg-surface-container-low/50">
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Mã đơn</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Khách hàng</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Sản phẩm</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Ngày</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-right">Tổng tiền</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Trạng thái</th>
                <th className="py-4 px-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {orders.map((order, i) => (
                <tr key={order.id} className="border-b border-outline/5 hover:bg-surface-container-lowest transition-colors group cursor-pointer">
                  <td className="py-4 px-6">
                    <Link to={`/orders/${i + 90}`} className="text-on-surface font-medium hover:text-primary transition-colors">{order.id}</Link>
                  </td>
                  <td className="py-4 px-6 text-on-surface">{order.customer}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{order.product}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{order.date}</td>
                  <td className="py-4 px-6 text-on-surface text-right font-medium">{order.amount}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link to={`/orders/${i + 90}`} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary inline-flex">
                      <span className="material-symbols-outlined">open_in_new</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low/50 border-t border-outline/10 flex justify-between items-center">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Hiển thị 6 trong 128 đơn hàng</span>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded border border-outline/20 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded border border-outline/20 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
