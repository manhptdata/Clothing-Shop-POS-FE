import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { logoutThunk } from '@/redux/slice/authSlice';

export default function DashboardPage() {
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
          <button className="font-button text-button border border-primary text-primary px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors">
            Xuất báo cáo
          </button>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/10 bg-surface-container-low/50">
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  Mã Đơn
                </th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  Khách hàng
                </th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  Sản phẩm
                </th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  Tổng tiền
                </th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              <tr className="border-b border-outline/5 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 text-on-surface font-medium">#ORD-0091</td>
                <td className="py-4 px-6 text-on-surface">Eleanor Vance</td>
                <td className="py-4 px-6 text-on-surface-variant">Khăn lụa - Xanh ngọc</td>
                <td className="py-4 px-6 text-on-surface">€350</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary-fixed/30 text-primary-container">
                    Hoàn thành
                  </span>
                </td>
              </tr>
              <tr className="border-b border-outline/5 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 text-on-surface font-medium">#ORD-0092</td>
                <td className="py-4 px-6 text-on-surface">Arthur Pendelton</td>
                <td className="py-4 px-6 text-on-surface-variant">Cặp da</td>
                <td className="py-4 px-6 text-on-surface">€1,200</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary-container/50 text-on-secondary-container">
                    Đang xử lý
                  </span>
                </td>
              </tr>
              <tr className="border-b border-outline/5 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 text-on-surface font-medium">#ORD-0093</td>
                <td className="py-4 px-6 text-on-surface">Sophia Lauren</td>
                <td className="py-4 px-6 text-on-surface-variant">Áo khoác len Cashmere</td>
                <td className="py-4 px-6 text-on-surface">€2,850</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#D4AF37]/20 text-[#574500]">
                    Đặt trước VIP
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 text-on-surface font-medium">#ORD-0094</td>
                <td className="py-4 px-6 text-on-surface">Marcus Reed</td>
                <td className="py-4 px-6 text-on-surface-variant">Khuy măng sét bạc</td>
                <td className="py-4 px-6 text-on-surface">€420</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary-fixed/30 text-primary-container">
                    Hoàn thành
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
