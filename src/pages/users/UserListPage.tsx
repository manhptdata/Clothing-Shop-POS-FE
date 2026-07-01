import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useGetUsersQuery } from '@/redux/api/userApi';
import { ROLE_LABEL } from '@/utils/constants';
import { useDebounce } from '@/hooks/useDebounce';

export default function UserListPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, activeFilter]);

  const { data: userResponse, isLoading, isFetching } = useGetUsersQuery({
    page: currentPage + 1, // Spring backend is 1-indexed
    size: pageSize,
    search: debouncedSearch || undefined,
    active: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
  });

  const users = (userResponse?.data as any)?.content || [];
  const totalPages = (userResponse?.data as any)?.totalPages || 0;
  const totalElements = (userResponse?.data as any)?.totalElements || 0;

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-md">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>Danh sách nhân viên</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Quản lý quyền truy cập, vai trò và trạng thái của nhân viên.</p>
        </div>
        <Link to="/users/new">
          <Button 
            leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
          >
            Thêm thành viên
          </Button>
        </Link>
      </div>

      <div className="bg-surface rounded-xl border border-outline/10 p-4 flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-body-sm text-body-sm transition-all"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="w-full pl-4 pr-4 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-body-sm text-body-sm cursor-pointer transition-all"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline/10 rounded-xl overflow-hidden mt-sm relative">
        {isFetching && (
          <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
          </div>
        )}
        {isLoading ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
            <p className="font-medium text-body-md">Đang tải danh sách nhân viên...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">badge</span>
            <p className="text-body-md">Không tìm thấy nhân viên nào.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface border-b border-outline/10">
              <tr>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold w-1/3">Họ tên</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold hidden md:table-cell">Tài khoản</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Vai trò</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold hidden lg:table-cell">Đăng nhập cuối</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {users.map((s: any) => {
                const initials = s.fullName?.substring(0, 2).toUpperCase() || 'NV';
                return (
                  <tr key={s.id} className={`hover:bg-surface-variant/20 transition-colors ${!s.active ? 'opacity-60' : ''}`}>
                    <td className="py-4 px-6">
                      <Link to={`/users/${s.id}/edit`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline/10 font-title-sm text-title-sm text-on-surface-variant">{initials}</div>
                        <span className={`font-body-md text-body-md font-medium text-on-surface hover:text-primary transition-colors ${!s.active ? 'line-through' : ''}`}>{s.fullName}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">{s.username}</td>
                    <td className="py-4 px-6">
                      <span className="font-body-sm text-body-sm text-on-surface">
                        {ROLE_LABEL[s.role] || s.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant hidden lg:table-cell">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/users/${s.id}/edit`} className={`font-label-caps text-label-caps hover:text-primary transition-colors ${s.active ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {s.active ? 'Hoạt động' : 'Tạm khóa'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        
        {users.length > 0 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            totalElements={totalElements}
            pageSize={pageSize}
            onSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(0);
            }}
          />
        )}
      </div>

    </div>
  );
}
