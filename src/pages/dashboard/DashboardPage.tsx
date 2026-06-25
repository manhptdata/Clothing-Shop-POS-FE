import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useGetDailyStatisticsQuery, useGetWeeklyStatisticsQuery } from '@/redux/api/statisticApi';
import { useGetOrdersQuery } from '@/redux/api/orderApi';
import type { Order } from '@/types/order.types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { data: statsData } = useGetDailyStatisticsQuery();
  const stats = statsData?.data;

  // Lấy thống kê tuần
  const { data: weeklyDataResponse, isLoading: isWeeklyLoading } = useGetWeeklyStatisticsQuery();
  
  // Format data for chart
  const weeklyData = (weeklyDataResponse?.data || []).map((item) => ({
    name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    'Doanh thu': item.revenue,
    'Số đơn': item.orderCount,
  }));

  // Lấy 5 đơn hàng mới nhất
  const { data: ordersResponse, isLoading: isOrdersLoading } = useGetOrdersQuery({ page: 0, size: 5 });
  const recentOrders = (ordersResponse?.data as any)?.content || (ordersResponse?.data as any)?.result || [];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const columns: Column<Order>[] = [
    { key: 'orderNumber', header: 'Mã Đơn', render: (row) => <span className="font-medium text-on-surface">{row.orderNumber || row.code}</span> },
    { key: 'customerName', header: 'Khách hàng', render: (row) => <span className="text-on-surface">{row.customerName || 'Khách lẻ'}</span> },
    { key: 'createdAt', header: 'Ngày tạo', render: (row) => <span className="text-on-surface-variant">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span> },
    { key: 'totalAmount', header: 'Tổng tiền', render: (row) => <span className="text-on-surface">{formatCurrency(row.totalAmount)}</span> },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => {
        let variant: 'success' | 'warning' | 'info' | 'danger' = 'info';
        let label: string = row.status;
        if (row.status === 'COMPLETED') { variant = 'success'; label = 'Hoàn thành'; }
        else if (row.status === 'PENDING') { variant = 'warning'; label = 'Đang xử lý'; }
        else if (row.status === 'CANCELLED') { variant = 'danger'; label = 'Đã hủy'; }
        return <Badge variant={variant}>{label}</Badge>;
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
          <div className="font-display-lg text-display-lg text-on-surface tracking-tighter">
            {stats ? formatCurrency(stats.dailyRevenue) : '...'}
          </div>
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
          <div className="font-display-lg text-display-lg text-on-surface tracking-tighter">
            {stats ? stats.newOrders : '...'}
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-sm">trending_flat</span>
            <span>Ổn định</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-surface rounded-xl border border-outline/10 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Lượng khách mới</span>
            <span className="material-symbols-outlined text-primary-container">groups</span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface tracking-tighter">
            {stats ? stats.newCustomers : '...'}
          </div>
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
        <div className="h-80 w-full relative">
          {isWeeklyLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">sync</span>
            </div>
          ) : weeklyData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value: any, name: any) => [
                    name === 'Doanh thu' ? formatCurrency(value as number) : value, 
                    name
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="Doanh thu" 
                  stroke="#1a73e8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
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
