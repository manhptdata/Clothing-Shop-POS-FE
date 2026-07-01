import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/Button';
import { useGetCategoriesQuery, useDeleteCategoryMutation, useDeleteHardCategoryMutation, useToggleCategoryActiveMutation } from '@/redux/api/categoryApi';
import CategoryFormModal from './components/CategoryFormModal';
import type { Category } from '@/types/category.type';

export default function CategoryListPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userPerms = user?.permissions || [];
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const hasManageProductPermission = isAdmin || userPerms.includes('MANAGE_PRODUCT');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'DELETED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading, isFetching } = useGetCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteHardCategory] = useDeleteHardCategoryMutation();
  const [toggleCategoryActive] = useToggleCategoryActiveMutation();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa danh mục "${category.name}"? Tất cả sản phẩm thuộc danh mục này sẽ được chuyển sang "Danh mục chung".`;
    if (window.confirm(confirmMessage)) {
      try {
        await deleteCategory(category.id).unwrap();
        toast.success('Xóa danh mục thành công');
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || 'Lỗi khi xóa danh mục');
      }
    }
  };

  const handleHardDelete = async (category: Category) => {
    if (category.active) {
      toast.error('Danh mục vẫn đang hoạt động, không thể xóa cứng. Hãy ngừng hoạt động danh mục trước!');
      return;
    }
    if (!category.deleted) {
      toast.error('Danh mục vẫn chưa được xóa mềm, không thể xóa cứng. Hãy xóa mềm trước!');
      return;
    }

    if (window.confirm(`CẢNH BÁO: Xóa cứng danh mục "${category.name}" không thể hoàn tác. Bạn có chắc chắn không?`)) {
      try {
        await deleteHardCategory(category.id).unwrap();
        toast.success('Xóa cứng thành công');
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || 'Lỗi khi xóa cứng danh mục');
      }
    }
  };

  const handleToggleActive = async (category: Category) => {
    const nextActiveState = !category.active;
    if (!nextActiveState) {
      const confirmMessage = `Ngừng hoạt động danh mục "${category.name}" sẽ chuyển toàn bộ sản phẩm thuộc danh mục này sang "Danh mục chung". Bạn có chắc chắn muốn tiếp tục?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }
    try {
      await toggleCategoryActive({ id: category.id, active: nextActiveState }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // Client-side filtering
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      // Filter by status
      if (filterStatus === 'ACTIVE' && (c.deleted || !c.active)) return false;
      if (filterStatus === 'DELETED' && !c.deleted) return false;
      
      // Filter by search term
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [categories, filterStatus, searchTerm]);

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-md">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
            Quản lý danh mục
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Quản lý các danh mục sản phẩm, trạng thái hiển thị.
          </p>
        </div>
        {hasManageProductPermission && (
          <Button
            onClick={handleAddNew}
            leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
          >
            Thêm danh mục
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-outline/10 p-4 flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Tìm theo tên danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-body-sm text-body-sm transition-all"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full pl-4 pr-4 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-body-sm text-body-sm cursor-pointer transition-all"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="DELETED">Đã xóa</option>
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
            <p className="font-medium text-body-md">Đang tải danh sách danh mục...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">category</span>
            <p className="text-body-md">Không tìm thấy danh mục nào.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface border-b border-outline/10">
              <tr>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold w-16">ID</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Tên danh mục</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-center w-32">Hoạt động</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-center w-32">Trạng thái</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right w-32">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {filteredCategories.map((c) => (
                <tr key={c.id} className={`hover:bg-surface-variant/20 transition-colors ${c.deleted ? 'opacity-60 bg-surface-container/30' : ''}`}>
                  <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant">{c.id}</td>
                  <td className="py-4 px-6 font-body-md text-body-md font-medium text-on-surface">{c.name}</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleToggleActive(c)}
                      disabled={c.deleted || !hasManageProductPermission}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        c.active ? 'bg-primary' : 'bg-outline-variant/50'
                      } ${c.deleted || !hasManageProductPermission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          c.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.deleted ? 'bg-error-container text-on-error-container' : 'bg-success-container text-on-success-container'}`}>
                      {c.deleted ? 'Đã xóa' : 'Bình thường'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {hasManageProductPermission && !c.deleted && (
                        <>
                          <button
                            onClick={() => handleEdit(c)}
                            className="text-on-surface-variant hover:text-primary transition-colors p-1"
                            title="Sửa danh mục"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="text-on-surface-variant hover:text-error transition-colors p-1"
                            title="Xóa danh mục"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </>
                      )}
                      {hasManageProductPermission && c.deleted && (
                        <button
                          onClick={() => handleHardDelete(c)}
                          className="text-error hover:text-error/80 transition-colors p-1"
                          title="Xóa cứng (không thể hoàn tác)"
                        >
                          <span className="material-symbols-outlined text-xl">delete_forever</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />
    </div>
  );
}
