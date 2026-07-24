import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useGetPeriodStatisticsQuery, useGetChartStatisticsQuery } from '@/redux/api/statisticApi';
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
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const queryArg = period === 'custom' ? { period, startDate, endDate } : period;

  // Lấy chỉ số thống kê theo mốc thời gian
  const { data: statsData, isLoading: isStatsLoading } = useGetPeriodStatisticsQuery(queryArg);
  const stats = statsData?.data;

  // Lấy dữ liệu biểu đồ theo mốc thời gian
  const { data: chartDataResponse, isLoading: isChartLoading } = useGetChartStatisticsQuery(queryArg);
  
  // Format data for chart
  const chartData = (chartDataResponse?.data || []).map((item) => ({
    name: period === 'year'
      ? `T${new Date(item.date).getMonth() + 1}`
      : new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    'Doanh thu': item.revenue,
    'Số đơn': item.orderCount,
  }));

  // Lấy 5 đơn hàng mới nhất
  const { data: ordersResponse } = useGetOrdersQuery({ page: 0, size: 5 });
  const recentOrders = (ordersResponse?.data as any)?.content || (ordersResponse?.data as any)?.result || [];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const periodLabels: Record<string, string> = {
    today: 'Hôm nay',
    week: 'Tuần này',
    month: 'Tháng này',
    year: 'Năm nay',
    custom: `Từ ${startDate ? new Date(startDate).toLocaleDateString('vi-VN') : ''} đến ${endDate ? new Date(endDate).toLocaleDateString('vi-VN') : ''}`,
  };

  const columns: Column<Order>[] = [
    { key: 'orderNumber', header: 'Mã Đơn', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.orderNumber || row.code}</span> },
    { key: 'customerName', header: 'Khách hàng', render: (row) => <span className="text-on-surface font-medium">{row.customerName || 'Khách lẻ vãng lai'}</span> },
    { key: 'createdAt', header: 'Ngày tạo', render: (row) => <span className="text-on-surface-variant text-xs">{new Date(row.createdAt).toLocaleString('vi-VN')}</span> },
    { key: 'totalAmount', header: 'Tổng tiền', render: (row) => <span className="text-on-surface font-bold">{formatCurrency(row.totalAmount)}</span> },
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

  // Calculated Payment breakdown
  const paymentBreakdown = stats?.paymentMethodBreakdown || {};
  const totalPaymentRev = Object.values(paymentBreakdown).reduce((sum, val) => sum + val, 0) || 1;
  const cashAmount = paymentBreakdown['CASH'] || 0;
  const transferAmount = paymentBreakdown['BANK_TRANSFER'] || 0;
  const cardAmount = paymentBreakdown['CARD'] || 0;

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-8">
      {/* Header & Date Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Tổng quan cửa hàng</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Theo dõi các chỉ số kinh doanh, tồn kho và xu hướng bán hàng thời gian thực.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {period === 'custom' && (
            <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-outline/15 shadow-sm text-xs">
              <span className="font-semibold text-on-surface-variant">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-bold text-primary focus:outline-none cursor-pointer"
              />
              <span className="font-semibold text-on-surface-variant">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-bold text-primary focus:outline-none cursor-pointer"
              />
            </div>
          )}
          <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl border border-outline/15 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
            <span className="text-xs font-medium text-on-surface-variant">Mốc thời gian:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="bg-transparent font-bold text-sm text-primary focus:outline-none cursor-pointer"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
              <option value="custom">📅 Chọn ngày tùy chỉnh</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5 Summary KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Doanh thu */}
        <div className="bg-surface rounded-xl border border-outline/10 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Doanh thu</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-on-surface tracking-tight">
              {isStatsLoading ? '...' : stats ? formatCurrency(stats.dailyRevenue) : '0đ'}
            </div>
            <div className="text-[11px] text-primary font-medium mt-1">
              Theo {periodLabels[period].toLowerCase()}
            </div>
          </div>
        </div>

        {/* Card 2: Lợi nhuận ròng */}
        <div className="bg-surface rounded-xl border border-outline/10 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Lợi nhuận ròng</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">monitoring</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {isStatsLoading ? '...' : stats && stats.dailyProfit !== undefined ? formatCurrency(stats.dailyProfit) : '0đ'}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              Doanh thu trừ Giá vốn
            </div>
          </div>
        </div>

        {/* Card 3: AOV Giá trị trung bình/đơn */}
        <div className="bg-surface rounded-xl border border-outline/10 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Giá trị TB/Đơn (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-amber-600 tracking-tight">
              {isStatsLoading ? '...' : stats?.averageOrderValue ? formatCurrency(stats.averageOrderValue) : '0đ'}
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">
              Doanh thu / Tổng đơn
            </div>
          </div>
        </div>

        {/* Card 4: Đơn hàng mới */}
        <div className="bg-surface rounded-xl border border-outline/10 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Đơn hàng mới</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">local_mall</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-on-surface tracking-tight">
              {isStatsLoading ? '...' : stats ? stats.newOrders : 0} <span className="text-xs font-normal text-on-surface-variant">đơn</span>
            </div>
            <div className="text-[11px] text-on-surface-variant font-medium mt-1">
              Đơn hàng {periodLabels[period].toLowerCase()}
            </div>
          </div>
        </div>

        {/* Card 5: Khách hàng mới */}
        <div className="bg-surface rounded-xl border border-outline/10 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Khách hàng mới</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-on-surface tracking-tight">
              {isStatsLoading ? '...' : stats ? stats.newCustomers : 0} <span className="text-xs font-normal text-on-surface-variant">khách</span>
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-1">
              Đăng ký mới
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Chart + Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section (2 cols) */}
        <section className="lg:col-span-2 bg-surface rounded-xl border border-outline/10 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-base text-on-surface">Xu hướng doanh thu ({periodLabels[period].toLowerCase()})</h2>
              <p className="text-xs text-on-surface-variant">Biểu đồ biến động doanh thu bán hàng theo thời gian.</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Xuất báo cáo
            </Button>
          </div>
          <div className="h-72 w-full relative">
            {isChartLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-sm">
                Chưa có dữ liệu giao dịch
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
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

        {/* Payment Breakdown Card (1 col) */}
        <section className="bg-surface rounded-xl border border-outline/10 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="font-bold text-base text-on-surface">Phương thức thanh toán</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Phân bổ tỷ lệ doanh thu theo kênh thanh toán.</p>
            
            <div className="mt-6 space-y-4">
              {/* Cash */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Tiền mặt (CASH)
                  </span>
                  <span className="text-on-surface">{formatCurrency(cashAmount)}</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.round((cashAmount / totalPaymentRev) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Transfer */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    Chuyển khoản (QR / Banking)
                  </span>
                  <span className="text-on-surface">{formatCurrency(transferAmount)}</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${Math.round((transferAmount / totalPaymentRev) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Card */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    Thẻ POS / Thẻ ngân hàng
                  </span>
                  <span className="text-on-surface">{formatCurrency(cardAmount)}</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.round((cardAmount / totalPaymentRev) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline/10 flex justify-between items-center text-xs text-on-surface-variant font-medium">
            <span>Tổng cộng thanh toán:</span>
            <span className="font-bold text-on-surface text-sm">{formatCurrency(cashAmount + transferAmount + cardAmount)}</span>
          </div>
        </section>
      </div>

      {/* Grid: Top 5 Best Sellers + Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best Sellers */}
        <section className="bg-surface rounded-xl border border-outline/10 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">trophy</span>
              Top 5 Sản phẩm bán chạy ({periodLabels[period].toLowerCase()})
            </h2>
            <Link to="/products" className="text-xs text-primary hover:underline font-semibold">
              Xem tất cả
            </Link>
          </div>

          {!stats?.topProducts || stats.topProducts.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant text-xs">
              Chưa có dữ liệu bán chạy trong mốc thời gian này
            </div>
          ) : (
            <div className="divide-y divide-outline/5 text-xs">
              {stats.topProducts.map((prod, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 hover:bg-surface-container-lowest transition-colors px-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] shrink-0 ${
                      idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      idx === 1 ? 'bg-slate-200 text-slate-700' :
                      idx === 2 ? 'bg-amber-700/10 text-amber-900' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-on-surface block">{prod.productName}</span>
                      <span className="text-[11px] text-slate-900 font-bold font-mono">SKU: {prod.productSku}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-primary block">{prod.soldQuantity} lượt bán</span>
                    <span className="text-[11px] font-medium text-on-surface-variant">{formatCurrency(prod.totalRevenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Low Stock Warnings */}
        <section className="bg-surface rounded-xl border border-outline/10 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600">warning</span>
              Cảnh báo tồn kho thấp (&le; 5 chiếc)
            </h2>
            <Link to="/warehouse/receipts" className="text-xs text-rose-600 hover:underline font-semibold">
              Nhập kho ngay
            </Link>
          </div>

          {!stats?.lowStockProducts || stats.lowStockProducts.length === 0 ? (
            <div className="py-12 text-center text-emerald-600 text-xs font-semibold flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
              Tất cả mặt hàng đều đầy đủ tồn kho an toàn!
            </div>
          ) : (
            <div className="divide-y divide-outline/5 text-xs">
              {stats.lowStockProducts.map((item) => (
                <div key={item.variantId} className="py-3 flex items-center justify-between gap-3 hover:bg-rose-50/20 transition-colors px-2 rounded-lg">
                  <div>
                    <span className="font-bold text-on-surface block">{item.productName}</span>
                    <span className="text-[11px] text-slate-900 font-bold font-mono">SKU: {item.sku}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-full text-[11px]">
                      Còn {item.currentQuantity} cái
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate('/warehouse/receipts')}
                      className="text-[11px] h-7 px-2 border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      Nhập kho
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Table Section: Recent Orders */}
      <section className="bg-surface rounded-xl border border-outline/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline/10 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-base text-on-surface">Đơn hàng mới tạo gần đây</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">5 giao dịch bán hàng phát sinh mới nhất trên hệ thống.</p>
          </div>
          <Link className="font-button text-xs text-primary hover:underline font-semibold" to="/orders">
            Xem tất cả đơn hàng
          </Link>
        </div>
        <Table columns={columns} data={recentOrders} rowKey={(row) => row.id} />
      </section>
    </div>
  );
}

