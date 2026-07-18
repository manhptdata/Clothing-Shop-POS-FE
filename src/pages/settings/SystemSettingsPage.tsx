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
  const [requireCancelApproval, setRequireCancelApproval] = useState(true);

  const [bankName, setBankName] = useState('MBBank');
  const [bankAccount, setBankAccount] = useState('SBSEPAY');
  const [accountName, setAccountName] = useState('SHOP QUAN AO');
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://api.vietqr.io/v2/banks')
      .then(res => res.json())
      .then(data => {
        if (data.code === '00') {
          setBanks(data.data);
        }
      })
      .catch(err => console.error('Lỗi khi tải danh sách ngân hàng', err));
  }, []);

  useEffect(() => {
    if (settings) {
      const returnSetting = settings.find(s => s.settingKey === 'REQUIRE_RETURN_APPROVAL');
      if (returnSetting) {
        setRequireReturnApproval(returnSetting.settingValue === 'true');
      }
      const cancelSetting = settings.find(s => s.settingKey === 'REQUIRE_CANCEL_APPROVAL');
      if (cancelSetting) {
        setRequireCancelApproval(cancelSetting.settingValue === 'true');
      }
      const bankNameSetting = settings.find(s => s.settingKey === 'PAYMENT_BANK_NAME');
      if (bankNameSetting) setBankName(bankNameSetting.settingValue);
      
      const bankAccSetting = settings.find(s => s.settingKey === 'PAYMENT_BANK_ACCOUNT');
      if (bankAccSetting) setBankAccount(bankAccSetting.settingValue);
      
      const accNameSetting = settings.find(s => s.settingKey === 'PAYMENT_ACCOUNT_NAME');
      if (accNameSetting) setAccountName(accNameSetting.settingValue);
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
      toast.success('Cập nhật cấu hình trả hàng thành công!');
    } catch (error: any) {
      toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật cấu hình');
    }
  };

  const handleToggleCancelApproval = async () => {
    const newChecked = !requireCancelApproval;
    try {
      await updateSetting({
        key: 'REQUIRE_CANCEL_APPROVAL',
        value: newChecked.toString(),
      }).unwrap();
      setRequireCancelApproval(newChecked);
      toast.success('Cập nhật cấu hình hủy đơn thành công!');
    } catch (error: any) {
      toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật cấu hình');
    }
  };

  const handleSaveBankConfig = async () => {
    try {
      await updateSetting({ key: 'PAYMENT_BANK_NAME', value: bankName }).unwrap();
      await updateSetting({ key: 'PAYMENT_BANK_ACCOUNT', value: bankAccount }).unwrap();
      await updateSetting({ key: 'PAYMENT_ACCOUNT_NAME', value: accountName }).unwrap();
      toast.success('Cập nhật cấu hình tài khoản ngân hàng thành công!');
    } catch (error: any) {
      toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật cấu hình ngân hàng');
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
        <div className="h-px bg-outline/10 w-full my-6"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-on-surface mb-1">Yêu cầu Quản lý phê duyệt khi hủy đơn hàng</h2>
            <p className="text-sm text-on-surface-variant">
              Khi bật, nhân viên thu ngân (Sale) sẽ phải nhập mã PIN của Quản lý hoặc Admin để có thể hủy hóa đơn.
            </p>
          </div>
          
          <button
            type="button"
            role="switch"
            aria-checked={requireCancelApproval}
            disabled={isUpdating}
            onClick={handleToggleCancelApproval}
            className={`${
              requireCancelApproval ? 'bg-primary' : 'bg-surface-container-high'
            } relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-white/75 disabled:opacity-50`}
          >
            <span
              aria-hidden="true"
              className={`${
                requireCancelApproval ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-outline/10 shadow-sm p-6 mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-on-surface mb-1">Cấu hình tài khoản nhận thanh toán QR</h2>
          <p className="text-sm text-on-surface-variant">
            Thông tin này sẽ được sử dụng để tạo mã QR thanh toán động cho các đơn hàng.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Ngân hàng</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-outline/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option value="">-- Chọn ngân hàng --</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.shortName}>
                  {bank.shortName} - {bank.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Số tài khoản</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Ví dụ: 1023456789"
              className="w-full h-11 px-4 rounded-xl border border-outline/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-on-surface mb-1">Tên chủ tài khoản</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Ví dụ: NGUYEN VAN A"
              className="w-full h-11 px-4 rounded-xl border border-outline/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveBankConfig}
            disabled={isUpdating}
            className="h-11 px-6 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Lưu cấu hình ngân hàng
          </button>
        </div>
      </div>
    </div>
  );
}
