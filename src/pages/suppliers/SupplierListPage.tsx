import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  useGetSuppliersQuery, 
  useSoftDeleteSupplierMutation, 
  useReactivateSupplierMutation,
  useHardDeleteSupplierMutation 
} from '@/redux/api/supplierApi';
import SupplierFormModal from './components/SupplierFormModal';
import type { Supplier } from '@/types/supplier.types';

export default function SupplierListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  
  // Paging state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Api query params
  const queryParams = useMemo(() => {
    return {
      page,
      size,
      search: searchTerm || undefined,
      isActive: filterStatus === 'ALL' ? undefined : filterStatus === 'ACTIVE',
    };
  }, [page, size, searchTerm, filterStatus]);

  const { data: pageData, isLoading, isFetching } = useGetSuppliersQuery(queryParams);
  const suppliers = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;
  const totalElements = pageData?.totalElements || 0;

  const [softDeleteSupplier] = useSoftDeleteSupplierMutation();
  const [reactivateSupplier] = useReactivateSupplierMutation();
  const [hardDeleteSupplier] = useHardDeleteSupplierMutation();

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleSoftDelete = async (supplier: Supplier) => {
    if (!supplier.active) return;
    
    const confirmMessage = `Bạn có chắc chắn muốn ngừng hoạt động nhà cung cấp "${supplier.name}"?`;
    if (window.confirm(confirmMessage)) {
      try {
        await softDeleteSupplier(supplier.id).unwrap();
        alert('Ngừng hoạt động thành công!');
      } catch (err: any) {
        alert(err?.data?.message || err?.message || 'Lỗi khi ngừng hoạt động');
      }
    }
  };

  const handleReactivate = async (supplier: Supplier) => {
    if (supplier.active) return;
    
    const confirmMessage = `Bạn có muốn kích hoạt lại nhà cung cấp "${supplier.name}"?`;
    if (window.confirm(confirmMessage)) {
      try {
        await reactivateSupplier(supplier.id).unwrap();
        alert('Kích hoạt lại thành công!');
      } catch (err: any) {
        alert(err?.data?.message || err?.message || 'Lỗi khi kích hoạt lại');
      }
    }
  };

  const handleHardDelete = async (supplier: Supplier) => {
    if (supplier.active) {
      alert('Nhà cung cấp vẫn đang hoạt động, không thể xóa cứng. Hãy ngừng hoạt động trước!');
      return;
    }

    if (window.confirm(`CẢNH BÁO: Xóa cứng nhà cung cấp "${supplier.name}" không thể hoàn tác. Bạn có chắc chắn không?`)) {
      try {
        await hardDeleteSupplier(supplier.id).unwrap();
        alert('Xóa cứng thành công');
      } catch (err: any) {
        alert(err?.data?.message || err?.message || 'Lỗi khi xóa cứng');
      }
    }
  };

  // Nút Previous Page
  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  // Nút Next Page
  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-md">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
            Quản lý nhà cung cấp
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Danh sách đối tác cung cấp hàng hóa cho cửa hàng.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
        >
          Thêm NCC
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-outline/10 p-4 flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0); // reset về trang 1
            }}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-body-sm text-body-sm transition-all"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setPage(0); // reset về trang 1
            }}
            className="w-full pl-4 pr-10 py-2 bg-transparent border border-outline/20 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-body-sm text-body-sm appearance-none cursor-pointer transition-all"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">filter_list</span>
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
            <p className="font-medium text-body-md">Đang tải danh sách...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">local_shipping</span>
            <p className="text-body-md">Không tìm thấy nhà cung cấp nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-surface border-b border-outline/10">
                <tr>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Tên & Thông tin liên hệ</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Địa chỉ</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-center w-32">Hoạt động</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-center w-32">Trạng thái</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right w-32">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {suppliers.map((s) => (
                  <tr key={s.id} className={`hover:bg-surface-variant/20 transition-colors ${!s.active ? 'opacity-60 bg-surface-container/30' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="font-body-md text-body-md font-medium text-on-surface mb-1">{s.name}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-4">
                        {s.phone && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">call</span>
                            {s.phone}
                          </span>
                        )}
                        {s.email && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            {s.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant">
                      <div className="line-clamp-2">{s.address || '-'}</div>
                      {s.note && <div className="text-xs italic text-on-surface-variant/70 mt-1 line-clamp-1">Ghi chú: {s.note}</div>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => s.active ? handleSoftDelete(s) : handleReactivate(s)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          s.active ? 'bg-primary cursor-pointer' : 'bg-outline-variant/50 cursor-pointer'
                        }`}
                        title={s.active ? "Ngừng hoạt động" : "Kích hoạt lại"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            s.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${!s.active ? 'bg-error-container text-on-error-container' : 'bg-success-container text-on-success-container'}`}>
                        {s.active ? 'Bình thường' : 'Ngừng HĐ'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.active && (
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-on-surface-variant hover:text-primary transition-colors p-1"
                            title="Sửa NCC"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                        )}
                        {!s.active && (
                          <button
                            onClick={() => handleHardDelete(s)}
                            className="text-error hover:text-error/80 transition-colors p-1"
                            title="Xóa vĩnh viễn"
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
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline/10 flex items-center justify-between bg-surface">
            <span className="text-sm text-on-surface-variant">
              Hiển thị {(page * size) + 1} - {Math.min((page + 1) * size, totalElements)} trong số {totalElements} kết quả
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 0}
                leftIcon={<span className="material-symbols-outlined">chevron_left</span>}
              >
                Trước
              </Button>
              <span className="text-sm text-on-surface-variant font-medium px-4">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= totalPages - 1}
                rightIcon={<span className="material-symbols-outlined">chevron_right</span>}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={editingSupplier}
      />
    </div>
  );
}
