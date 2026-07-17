import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  useGetUserByIdQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation,
  useToggleUserActiveMutation 
} from '@/redux/api/userApi';
import { useGetRolesQuery } from '@/redux/api/roleApi';
import { ROLE_LABEL } from '@/utils/constants';

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const userId = id ? parseInt(id, 10) : 0;

  const { data: userData, isLoading } = useGetUserByIdQuery(userId, { skip: !isEdit });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [toggleActive] = useToggleUserActiveMutation();

  const employee = userData?.data;

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    roleId: 0,
    phone: '',
    email: '',
  });

  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
  const roles = rolesData?.data || [];

  const [active, setActive] = useState(true);

  // Sync data when loaded
  useEffect(() => {
    if (isEdit && employee) {
      setFormData({
        fullName: employee.fullName || '',
        username: employee.username || '',
        password: '', // We don't load password
        roleId: 0, // This needs to be matched by name or returned by API. If API only returns roleName, we have to find it.
        phone: employee.phone || '',
        email: employee.email || '',
      });
      if (rolesData?.data) {
        const foundRole = rolesData.data.find(r => r.name === employee.role);
        if (foundRole) {
          setFormData(prev => ({ ...prev, roleId: foundRole.id }));
        }
      }
      setActive(employee.active);
    }
  }, [employee, isEdit, rolesData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // Update
        const payload = {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          roleId: Number(formData.roleId),
        };
        await updateUser({ id: userId, data: payload }).unwrap();
        // Cập nhật trạng thái nếu thay đổi
        if (employee && employee.active !== active) {
          await toggleActive({ id: userId, isActive: active }).unwrap();
        }
        toast.success('Cập nhật thông tin nhân viên thành công!');
        navigate('/users');
      } else {
        // Create
        if (!formData.password) {
          toast.error('Vui lòng nhập mật khẩu tạm cho nhân viên mới');
          return;
        }
        const payload = {
          fullName: formData.fullName,
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          email: formData.email,
          roleId: Number(formData.roleId),
        };
        await createUser(payload).unwrap();
        toast.success('Tạo nhân viên mới thành công!');
        navigate('/users');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu.');
    }
  };

  if ((isEdit && isLoading) || isLoadingRoles) {
    return <div className="p-10 text-center text-on-surface-variant font-medium">Đang tải thông tin...</div>;
  }

  return (
    <div className="max-w-[960px] mx-auto w-full pb-lg">
      <div className="mb-md">
        <Link to="/users" className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors w-fit">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-body-sm text-body-sm">Quay lại danh sách nhân viên</span>
        </Link>
      </div>

      <div className="mb-lg border-b border-outline/10 pb-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
          {isEdit ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Cấu hình quyền truy cập, vai trò và trạng thái của nhân viên.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-8 flex flex-col gap-md">
          <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-md">
            <h3 className="font-title-sm text-title-sm text-on-surface pb-sm border-b border-outline/10">Thông tin cá nhân</h3>
            
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Họ và tên</label>
              <input
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="VD: Nguyễn Văn A"
                className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded"
                type="text"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Tên đăng nhập (Tài khoản)</label>
              <input
                name="username"
                required
                disabled={isEdit}
                value={formData.username}
                onChange={handleInputChange}
                placeholder="VD: nguyenva"
                className={`w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded ${isEdit ? 'opacity-50 cursor-not-allowed text-on-surface-variant' : ''}`}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Số điện thoại</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="VD: 0987654321"
                className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded"
                type="text"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="VD: nva@sapo.vn"
                className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded"
                type="email"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Vai trò</label>
              <div className="relative">
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded cursor-pointer"
                >
                  <option value={0} disabled>Chọn vai trò</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{ROLE_LABEL[r.name] || r.name} {r.system ? '(Mặc định)' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {!isEdit && (
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Mật khẩu tạm</label>
                <input
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded"
                  type="password"
                />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-md">
          {isEdit && (
            <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-sm">
              <h3 className="font-title-sm text-title-sm text-on-surface pb-xs border-b border-outline/10">Trạng thái tài khoản</h3>
              
              <div className="flex items-center justify-between py-sm">
                <span className={`font-body-md text-body-md ${active ? 'text-[#4ade80]' : 'text-error'}`}>
                  {active ? 'Đang hoạt động' : 'Tạm khóa'}
                </span>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${active ? 'bg-primary' : 'bg-outline-variant/30'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Tài khoản bị tạm khóa sẽ không thể truy cập vào hệ thống POS ngay lập tức. Dữ liệu hồ sơ vẫn được giữ nguyên.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-sm">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="w-full h-12 bg-primary text-on-primary rounded-lg font-button text-button hover:opacity-90 transition-opacity flex items-center justify-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCreating || isUpdating ? 'hourglass_empty' : 'done'}
              </span>
              {isCreating || isUpdating ? 'Đang xử lý...' : 'Lưu thông tin'}
            </button>
            <Link
              to="/users"
              className="w-full h-12 border border-outline/30 text-on-surface rounded-lg font-button text-button hover:bg-surface-container flex items-center justify-center transition-colors"
            >
              Hủy
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
