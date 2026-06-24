import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const recentOrders = [
    { id: '#ORD-0091', customer: 'Eleanor Vance', product: 'Khăn lụa - Xanh ngọc', total: '€350', status: 'Hoàn thành' },
    { id: '#ORD-0092', customer: 'Arthur Pendelton', product: 'Cặp da', total: '€1,200', status: 'Đang xử lý' },
    { id: '#ORD-0093', customer: 'Sophia Lauren', product: 'Áo khoác len Cashmere', total: '€2,850', status: 'Đặt trước VIP' },
    { id: '#ORD-0094', customer: 'Marcus Reed', product: 'Khuy măng sét bạc', total: '€420', status: 'Hoàn thành' },
  ];

  const columns: Column<typeof recentOrders[0]>[] = [
    { key: 'id', header: 'Mã Đơn', render: (row) => <span className="font-medium text-on-surface">{row.id}</span> },
    { key: 'customer', header: 'Khách hàng', render: (row) => <span className="text-on-surface">{row.customer}</span> },
    { key: 'product', header: 'Sản phẩm', render: (row) => <span className="text-on-surface-variant">{row.product}</span> },
    { key: 'total', header: 'Tổng tiền', render: (row) => <span className="text-on-surface">{row.total}</span> },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => {
        let variant: 'success' | 'warning' | 'info' = 'info';
        if (row.status === 'Hoàn thành') variant = 'success';
        else if (row.status === 'Đặt trước VIP') variant = 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-surface rounded-xl border border-outline/10 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Doanh thu hôm nay</span>
            <span className="material-symbols-outlined text-primary-container">payments</span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface tracking-tighter">€14,250</div>
          <div className="flex items-center gap-2 text-primary-container font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12.5% so với hôm qua</span>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-surface rounded-xl border border-outline/10 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Đơn hàng mới</span>
            <span className="material-symbols-outlined text-primary-container">local_mall</span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface tracking-tighter">48</div>
          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-sm">trending_flat</span>
            <span>Ổn định</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-surface rounded-xl border border-outline/10 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Tổng khách hàng</span>
            <span className="material-symbols-outlined text-primary-container">groups</span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface tracking-tighter">1,204</div>
          <div className="flex items-center gap-2 text-primary-container font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+3 khách VIP mới</span>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="mb-8 bg-surface rounded-xl border border-outline/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Xu hướng bán hàng tuần</h2>
          <Button variant="outline">
            Xuất báo cáo
          </Button>
        </div>
        <div className="h-72 w-full relative flex items-center justify-center border-dashed border-2 border-outline/20 rounded-lg">
          <p className="text-on-surface-variant font-body-sm">Biểu đồ (Cần cài đặt Chart.js)</p>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-surface rounded-xl border border-outline/10 overflow-hidden">
        <div className="p-6 border-b border-outline/10 flex justify-between items-center">
          <h2 className="font-title-sm text-title-sm text-on-surface">Đơn hàng gần đây</h2>
          <Link className="font-button text-button text-primary hover:underline" to="/orders">
            Xem tất cả
          </Link>
        </div>
        <Table columns={columns} data={recentOrders} rowKey={(row) => row.id} />
      </section>
    </div>
  );
}
