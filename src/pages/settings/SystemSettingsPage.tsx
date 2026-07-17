import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateSettingMutation } from '@/redux/api/settingApi';
import { useAppSelector } from '@/redux/hooks';

export default function SystemSettingsPage() {
  const { data: settingsRes, isLoading } = useGetSettingsQuery();
  const settings = settingsRes?.data || [];
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();
  const { user } = useAppSelector(state => state.auth);

  const [requireReturnApproval, setRequireReturnApproval] = useState(true);

  useEffect(() => {
    if (settings) {
      const returnSetting = settings.find(s => s.settingKey === 'REQUIRE_RETURN_APPROVAL');
      if (returnSetting) {
        setRequireReturnApproval(returnSetting.settingValue === 'true');
      }
    }
  }, [settings]);

  const handleToggleReturnApproval = async () => {
    const newChecked = !requireReturnApproval;
    try {
      await updateSetting({
        key: 'REQUIRE_RETURN_APPROVAL',
        value: newChecked.toString(),
      }).unwrap();
      setRequireReturnApproval(newChecked);
      toast.success('Cập nhật cấu hình thành công!');
    } catch (error: any) {
      toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật cấu hình');
    }
  };

  if (user?.role !== 'ROLE_ADMIN') {
    return <div className="p-6 text-on-surface">Chỉ Admin mới có quyền truy cập trang này.</div>;
  }

  if (isLoading) {
    return <div className="p-6 text-on-surface">Đang tải cấu hình...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Cấu hình Hệ thống</h1>
      
      <div className="bg-surface rounded-2xl border border-outline/10 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-on-surface mb-1">Yêu cầu Quản lý phê duyệt khi trả hàng</h2>
            <p className="text-sm text-on-surface-variant">
              Khi bật, nhân viên thu ngân (Sale) sẽ phải nhập mã PIN của Quản lý hoặc Admin để có thể hoàn tất giao dịch trả hàng.
            </p>
          </div>
          
          <button
            type="button"
            role="switch"
            aria-checked={requireReturnApproval}
            disabled={isUpdating}
            onClick={handleToggleReturnApproval}
            className={`${
              requireReturnApproval ? 'bg-primary' : 'bg-surface-container-high'
            } relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-white/75 disabled:opacity-50`}
          >
            <span
              aria-hidden="true"
              className={`${
                requireReturnApproval ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>
        <div className="h-px bg-outline/10 w-full mt-6"></div>
      </div>
    </div>
  );
}
