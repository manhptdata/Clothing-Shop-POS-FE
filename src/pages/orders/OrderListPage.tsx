import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';

const orders = [
  { id: '#ORD-0091', customer: 'Eleanor Vance', product: 'Khăn lụa - Xanh ngọc', amount: '€350', date: 'Hôm nay, 10:22 SA', status: 'Hoàn thành' },
  { id: '#ORD-0092', customer: 'Arthur Pendelton', product: 'Cặp da', amount: '€1,200', date: 'Hôm nay, 09:48 SA', status: 'Đang xử lý' },
  { id: '#ORD-0093', customer: 'Sophia Lauren', product: 'Áo khoác len Cashmere', amount: '€2,850', date: 'Hôm nay, 09:15 SA', status: 'Đặt trước VIP' },
  { id: '#ORD-0094', customer: 'Marcus Reed', product: 'Khuy măng sét bạc', amount: '€420', date: 'Hôm qua, 18:30 CH', status: 'Hoàn thành' },
  { id: '#ORD-0095', customer: 'Clara Dubois', product: 'Áo lụa xếp ly', amount: '€890', date: 'Hôm qua, 17:05 CH', status: 'Đang xử lý' },
  { id: '#ORD-0090', customer: 'Julian Blackwood', product: 'Áo khoác len Trench', amount: '€2,450', date: 'Hôm qua, 14:20 CH', status: 'Đã hủy' },
];

export default function OrderListPage() {
  const navigate = useNavigate();

  const columns: Column<typeof orders[0]>[] = [
    { key: 'id', header: 'Mã đơn', render: (row) => <span className="font-medium text-on-surface hover:text-primary transition-colors">{row.id}</span> },
    { key: 'customer', header: 'Khách hàng', render: (row) => <span className="text-on-surface">{row.customer}</span> },
    { key: 'product', header: 'Sản phẩm', render: (row) => <span className="text-on-surface-variant">{row.product}</span> },
    { key: 'date', header: 'Ngày', render: (row) => <span className="text-on-surface-variant">{row.date}</span> },
    { key: 'amount', header: 'Tổng tiền', className: 'text-right', render: (row) => <span className="text-on-surface text-right block font-medium">{row.amount}</span> },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (row.status === 'Hoàn thành') variant = 'success';
        else if (row.status === 'Đặt trước VIP') variant = 'warning';
        else if (row.status === 'Đã hủy') variant = 'danger';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (row) => {
        // Extract id number from format #ORD-XXXX to simulate index for routing (just for mock)
        const orderIndex = parseInt(row.id.split('-')[1]);
        return (
          <Link to={`/orders/${orderIndex}`} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary inline-flex" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined">open_in_new</span>
          </Link>
        );
      },
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>Đơn hàng</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Quản lý tất cả giao dịch và lịch sử đơn hàng.</p>
        </div>
        <div className="flex gap-sm">
          <Button
            variant="outline"
            leftIcon={<span className="material-symbols-outlined text-[18px]">filter_list</span>}
          >
            Lọc
          </Button>
          <Link to="/orders/new">
            <Button
              leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
            >
              Tạo đơn mới
            </Button>
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
        <Table 
          columns={columns} 
          data={orders} 
          rowKey={(row) => row.id} 
          onRowClick={(row) => {
            const orderIndex = parseInt(row.id.split('-')[1]);
            navigate(`/orders/${orderIndex}`);
          }} 
        />
        <Pagination
          totalPages={13}
          currentPage={0}
          onPageChange={(page) => console.log('Page:', page)}
          totalElements={128}
          pageSize={10}
          onSizeChange={(size) => console.log('Size:', size)}
        />
      </div>
    </div>
  );
}
