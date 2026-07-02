import { useState } from 'react';
import { useGetRolesQuery, useDeleteRoleMutation, useCreateRoleMutation, useUpdateRoleMutation, RoleResponse } from '@/redux/api/roleApi';
import { toast } from 'react-hot-toast';
import { ROLE_LABEL } from '@/utils/constants';

const AVAILABLE_PERMISSIONS = [
  'VIEW_REPORT', 'VIEW_ORDER', 'CREATE_ORDER', 'CANCEL_ORDER',
  'VIEW_PRODUCT', 'MANAGE_PRODUCT', 'VIEW_CATEGORY', 'MANAGE_CATEGORY',
  'VIEW_SUPPLIER', 'MANAGE_SUPPLIER', 'VIEW_RECEIPT', 'MANAGE_RECEIPT',
  'VIEW_CUSTOMER', 'MANAGE_CUSTOMER', 'VIEW_CAMPAIGN', 'MANAGE_CAMPAIGN',
  'VIEW_SHIFT', 'MANAGE_SHIFT', 'MANAGE_USER', 'MANAGE_ROLE'
];

const PERMISSION_LABELS: Record<string, string> = {
  VIEW_REPORT: 'Xem báo cáo',
  VIEW_ORDER: 'Xem đơn hàng',
  CREATE_ORDER: 'Tạo đơn hàng',
  CANCEL_ORDER: 'Hủy đơn hàng',
  VIEW_PRODUCT: 'Xem sản phẩm',
  MANAGE_PRODUCT: 'Quản lý sản phẩm',
  VIEW_CATEGORY: 'Xem danh mục',
  MANAGE_CATEGORY: 'Quản lý danh mục',
  VIEW_SUPPLIER: 'Xem nhà cung cấp',
  MANAGE_SUPPLIER: 'Quản lý nhà cung cấp',
  VIEW_RECEIPT: 'Xem phiếu nhập',
  MANAGE_RECEIPT: 'Quản lý phiếu nhập',
  VIEW_CUSTOMER: 'Xem khách hàng',
  MANAGE_CUSTOMER: 'Quản lý khách hàng',
  VIEW_CAMPAIGN: 'Xem chiến dịch',
  MANAGE_CAMPAIGN: 'Quản lý chiến dịch',
  VIEW_SHIFT: 'Xem giao ca',
  MANAGE_SHIFT: 'Quản lý giao ca',
  MANAGE_USER: 'Quản lý nhân viên',
  MANAGE_ROLE: 'Quản lý vai trò'
};

export default function RoleSettingsPage() {
  const { data, isLoading, refetch } = useGetRolesQuery();
  const [deleteRole] = useDeleteRoleMutation();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const roles = data?.data || [];

  const handleOpenModal = (role?: RoleResponse) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions || []
      });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error('Vui lòng nhập tên vai trò');
    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, body: formData }).unwrap();
        toast.success('Cập nhật thành công');
      } else {
        await createRole(formData).unwrap();
        toast.success('Thêm mới thành công');
      }
      handleCloseModal();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmId === null) return;
    setIsDeleting(true);
    try {
      await deleteRole(deleteConfirmId).unwrap();
      toast.success('Xóa vai trò thành công');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Quản lý Vai Trò</h1>
          <p className="text-on-surface-variant mt-1">Thiết lập các vai trò và quyền hạn tương ứng</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm vai trò
        </button>
      </div>

      <div className="bg-surface glass-panel rounded-xl shadow-sm border border-outline/10 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left min-w-[600px]">
          <thead className="bg-surface-container-low border-b border-outline/10">
            <tr>
              <th className="px-6 py-4 font-semibold text-on-surface">Tên vai trò</th>
              <th className="px-6 py-4 font-semibold text-on-surface">Mô tả</th>
              <th className="px-6 py-4 font-semibold text-on-surface">Quyền hạn</th>
              <th className="px-6 py-4 font-semibold text-on-surface text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {roles.map(role => (
              <tr key={role.id} className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-on-surface">{ROLE_LABEL[role.name] || role.name}</div>
                  {role.system && <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Hệ thống</span>}
                </td>
                <td className="px-6 py-4 text-on-surface-variant text-sm">{role.description}</td>
                <td className="px-6 py-4 text-sm">
                  {role.system ? (
                    <span className="text-on-surface-variant italic">Mặc định của hệ thống</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions || []).slice(0, 3).map(p => (
                        <span key={p} className="bg-surface-container-high px-2 py-1 rounded text-xs">{PERMISSION_LABELS[p] || p}</span>
                      ))}
                      {(role.permissions || []).length > 3 && (
                        <span className="bg-surface-container-high px-2 py-1 rounded text-xs">+{role.permissions.length - 3}</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {!role.system && (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(role)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => setDeleteConfirmId(role.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingRole ? 'Cập nhật vai trò' : 'Thêm vai trò mới'}</h2>
              <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên vai trò *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="VD: Quản lý chi nhánh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4 pb-2 border-b border-outline/10">Danh sách Quyền hạn</h3>
                <div className="grid grid-cols-3 gap-3">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isSelected = formData.permissions.includes(perm);
                    return (
                      <div
                        key={perm}
                        onClick={() => togglePermission(perm)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-outline/20 hover:border-outline'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline/50'
                        }`}>
                          {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </div>
                        <span className="text-sm">{PERMISSION_LABELS[perm] || perm}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-outline/10 flex justify-end gap-3 bg-surface-container-low/50 rounded-b-2xl">
              <button onClick={handleCloseModal} className="px-5 py-2 rounded-lg font-medium hover:bg-outline/5 transition-colors">
                Hủy
              </button>
              <button onClick={handleSave} className="px-5 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-opacity">
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteConfirmId(null)} />
          <div className="relative bg-surface rounded-2xl w-full max-w-sm shadow-xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-error text-[22px]">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Xóa vai trò</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-1">
              Bạn có chắc chắn muốn xóa vai trò này không?
            </p>
            <p className="text-xs text-error/80 font-medium mb-5">
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-medium text-sm hover:bg-outline/5 transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-error text-white rounded-lg font-medium text-sm hover:bg-error/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting
                  ? <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Đang xóa...</>
                  : <><span className="material-symbols-outlined text-[16px]">delete</span> Xóa vai trò</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
