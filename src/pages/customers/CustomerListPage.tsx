import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';

const customers = [
  { id: 1, name: 'Eleanor Vance', email: 'e.vance@example.com', phone: '+33 6 12 34 56 78', spent: '€ 14,250', points: '2,850', rank: 'Vàng', rankClass: 'bg-secondary-fixed text-on-secondary-fixed border-secondary/20', initials: 'EV' },
  { id: 2, name: 'Julian Blackwood', email: 'j.blackwood@example.com', phone: '+44 7700 900077', spent: '€ 8,400', points: '1,200', rank: 'Bạc', rankClass: 'bg-surface-variant text-on-surface-variant border-outline-variant/50', initials: 'JB' },
  { id: 3, name: 'Clara Dubois', email: 'cdubois.art@example.com', phone: '+33 6 98 76 54 32', spent: '€ 3,150', points: '450', rank: 'Đồng', rankClass: 'bg-tertiary-container text-tertiary border-tertiary/20', initials: 'CD' },
  { id: 4, name: 'Marcus Rossi', email: 'm.rossi.design@example.com', phone: '+39 340 123 4567', spent: '€ 1,800', points: '180', rank: 'Đồng', rankClass: 'bg-tertiary-container text-tertiary border-tertiary/20', initials: 'MR' },
];

export default function CustomerListPage() {
  const navigate = useNavigate();

  const columns: Column<typeof customers[0]>[] = [
    {
      key: 'name',
      header: 'Khách hàng',
      render: (row) => (
        <div className="flex items-center gap-sm">
          <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant/15 font-title-sm text-title-sm text-on-surface-variant">
            {row.initials}
          </div>
          <div>
            <div className="font-title-sm text-title-sm text-on-surface">{row.name}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Số điện thoại', render: (row) => <span className="text-on-surface-variant">{row.phone}</span> },
    { key: 'spent', header: 'Tổng chi tiêu', className: 'text-right', render: (row) => <span className="text-on-surface text-right block">{row.spent}</span> },
    { key: 'points', header: 'Điểm tích lũy', className: 'text-right', render: (row) => <span className="text-on-surface-variant text-right block">{row.points}</span> },
    {
      key: 'rank',
      header: 'Hạng',
      render: (row) => {
        // Here we just map the rank text to some Badge variant for demo purposes
        let variant: 'success' | 'warning' | 'info' | 'default' = 'default';
        if (row.rank === 'Vàng') variant = 'warning';
        else if (row.rank === 'Bạc') variant = 'info';
        else if (row.rank === 'Đồng') variant = 'default';
        return <Badge variant={variant}>{row.rank}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (row) => (
        <Link to={`/customers/${row.id}/edit`} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
          <span className="material-symbols-outlined">edit</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight">Khách hàng</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Quản lý danh sách khách hàng.</p>
        </div>
        <div className="flex gap-sm">
          <Button
            variant="outline"
            leftIcon={<span className="material-symbols-outlined text-[18px]">filter_list</span>}
          >
            Lọc
          </Button>
          <Link to="/customers/new">
            <Button
              leftIcon={<span className="material-symbols-outlined text-[18px]">person_add</span>}
            >
              Thêm khách hàng
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-lg overflow-hidden">
        <Table 
          columns={columns} 
          data={customers} 
          rowKey={(row) => row.id} 
          onRowClick={(row) => navigate(`/customers/${row.id}/edit`)} 
        />
        <Pagination
          totalPages={10}
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
