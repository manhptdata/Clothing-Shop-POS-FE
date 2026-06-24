import { Link } from 'react-router-dom';

const customers = [
  { id: 1, name: 'Eleanor Vance', email: 'e.vance@example.com', phone: '+33 6 12 34 56 78', spent: '€ 14,250', points: '2,850', rank: 'Vàng', rankClass: 'bg-secondary-fixed text-on-secondary-fixed border-secondary/20', initials: 'EV' },
  { id: 2, name: 'Julian Blackwood', email: 'j.blackwood@example.com', phone: '+44 7700 900077', spent: '€ 8,400', points: '1,200', rank: 'Bạc', rankClass: 'bg-surface-variant text-on-surface-variant border-outline-variant/50', initials: 'JB' },
  { id: 3, name: 'Clara Dubois', email: 'cdubois.art@example.com', phone: '+33 6 98 76 54 32', spent: '€ 3,150', points: '450', rank: 'Đồng', rankClass: 'bg-tertiary-container text-tertiary border-tertiary/20', initials: 'CD' },
  { id: 4, name: 'Marcus Rossi', email: 'm.rossi.design@example.com', phone: '+39 340 123 4567', spent: '€ 1,800', points: '180', rank: 'Đồng', rankClass: 'bg-tertiary-container text-tertiary border-tertiary/20', initials: 'MR' },
];

export default function CustomerListPage() {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight">Khách hàng</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Quản lý danh sách khách hàng.</p>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm border border-primary text-primary rounded font-button text-button hover:bg-primary/5 flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Lọc
          </button>
          <Link to="/customers/new" className="px-md py-sm bg-primary text-on-primary rounded font-button text-button hover:opacity-90 flex items-center gap-xs transition-opacity">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Thêm khách hàng
          </Link>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant/15">
            <tr>
              <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Khách hàng</th>
              <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Số điện thoại</th>
              <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Tổng chi tiêu</th>
              <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Điểm tích lũy</th>
              <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Hạng</th>
              <th className="py-sm px-md w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer">
                <td className="py-md px-md">
                  <Link to={`/customers/${c.id}/edit`} className="flex items-center gap-sm">
                    <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant/15 font-title-sm text-title-sm text-on-surface-variant">{c.initials}</div>
                    <div>
                      <div className="font-title-sm text-title-sm text-on-surface">{c.name}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{c.email}</div>
                    </div>
                  </Link>
                </td>
                <td className="py-md px-md font-body-md text-body-md text-on-surface-variant">{c.phone}</td>
                <td className="py-md px-md font-body-md text-body-md text-on-surface text-right">{c.spent}</td>
                <td className="py-md px-md font-body-md text-body-md text-on-surface-variant text-right">{c.points}</td>
                <td className="py-md px-md">
                  <span className={`inline-flex items-center px-2 py-1 rounded font-label-caps text-label-caps uppercase border ${c.rankClass}`}>{c.rank}</span>
                </td>
                <td className="py-md px-md text-right">
                  <Link to={`/customers/${c.id}/edit`} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-md py-sm bg-surface-container-low border-t border-outline-variant/15 flex justify-between items-center">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Đang hiển thị 1 đến 4 trong 128 khách hàng</span>
          <div className="flex gap-xs">
            <button className="w-8 h-8 rounded border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
