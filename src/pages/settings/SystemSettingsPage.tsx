import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateSettingMutation } from '@/redux/api/settingApi';
import { useAppSelector } from '@/redux/hooks';
import { useNotifications } from '@/providers/NotificationProvider';

export default function SystemSettingsPage() {
  const { data: settingsRes, isLoading } = useGetSettingsQuery();
  const settings = settingsRes?.data || [];
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();
  const { user } = useAppSelector(state => state.auth);

  const [requireReturnApproval, setRequireReturnApproval] = useState(true);
  const [requireCancelApproval, setRequireCancelApproval] = useState(true);
  const [maxPendingOrders, setMaxPendingOrders] = useState<number>(3);
  const [pendingTimeoutMinutes, setPendingTimeoutMinutes] = useState<number>(30);

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
      const maxPendingSetting = settings.find(s => s.settingKey === 'MAX_PENDING_ORDERS_PER_CUSTOMER');
      if (maxPendingSetting) {
        setMaxPendingOrders(parseInt(maxPendingSetting.settingValue) || 3);
      }
      const timeoutSetting = settings.find(s => s.settingKey === 'PENDING_ORDER_TIMEOUT_MINUTES');
      if (timeoutSetting) {
        setPendingTimeoutMinutes(parseInt(timeoutSetting.settingValue) || 30);
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

  const handleSaveMaxPendingConfig = async () => {
    try {
      if (maxPendingOrders < 1) {
        toast.error('Số lượng đơn tối đa phải lớn hơn 0');
        return;
      }
      await updateSetting({ key: 'MAX_PENDING_ORDERS_PER_CUSTOMER', value: maxPendingOrders.toString() }).unwrap();
      toast.success('Cập nhật giới hạn đơn tạm thành công!');
    } catch (error: any) {
      toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật cấu hình');
    }
  };

  const handleSavePendingTimeoutConfig = async () => {
    try {
      if (pendingTimeoutMinutes < 1) {
        toast.error('Thời gian tự động dọn dẹp phải lớn hơn 0 phút');
        return;
      }
      await updateSetting({ key: 'PENDING_ORDER_TIMEOUT_MINUTES', value: pendingTimeoutMinutes.toString() }).unwrap();
      toast.success('Cập nhật thời gian tự động hủy đơn chờ thành công!');
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
        
        <div className="h-px bg-outline/10 w-full my-6"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-on-surface mb-1">Giới hạn số lượng đơn giữ tạm cho mỗi khách hàng</h2>
            <p className="text-sm text-on-surface-variant">
              Quy định số lượng tối đa các đơn hàng (ở trạng thái PENDING) mà một khách hàng có thể giữ trên hệ thống.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={maxPendingOrders}
              onChange={(e) => setMaxPendingOrders(parseInt(e.target.value) || 1)}
              className="w-24 h-11 px-4 rounded-xl border border-outline/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-center"
            />
            <button
              onClick={handleSaveMaxPendingConfig}
              disabled={isUpdating}
              className="h-11 px-4 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Lưu
            </button>
          </div>
        </div>

        <div className="h-px bg-outline/10 w-full my-6"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-on-surface mb-1">Thời gian tự động dọn dẹp đơn chờ chưa cọc (phút)</h2>
            <p className="text-sm text-on-surface-variant">
              Quy định số phút tự động hủy các đơn hàng chờ thanh toán (0đ) quá hạn để hoàn lại kho hàng khả dụng.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="1440"
              value={pendingTimeoutMinutes}
              onChange={(e) => setPendingTimeoutMinutes(parseInt(e.target.value) || 1)}
              className="w-24 h-11 px-4 rounded-xl border border-outline/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-center"
            />
            <button
              onClick={handleSavePendingTimeoutConfig}
              disabled={isUpdating}
              className="h-11 px-4 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Lưu
            </button>
          </div>
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

      {/* Cấu hình danh mục Ca làm việc */}
      <ShiftConfigSection />
    </div>
  );
}

function ShiftConfigSection() {
  const { fetchShiftConfigs, createShiftConfig, deleteShiftConfig } = useNotifications();
  const [shiftConfigs, setShiftConfigs] = useState<any[]>([]);
  const [newShiftName, setNewShiftName] = useState('');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('15:00');
  const [loading, setLoading] = useState(false);

  const loadShiftConfigs = async () => {
    const list = await fetchShiftConfigs();
    setShiftConfigs(list);
  };

  useEffect(() => {
    loadShiftConfigs();
  }, []);

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftName.trim()) {
      toast.error('Vui lòng nhập tên ca làm việc');
      return;
    }
    setLoading(true);
    try {
      await createShiftConfig({
        name: newShiftName.trim(),
        startTime: newStartTime.length === 5 ? `${newStartTime}:00` : newStartTime,
        endTime: newEndTime.length === 5 ? `${newEndTime}:00` : newEndTime,
      });
      setNewShiftName('');
      loadShiftConfigs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn ngưng hoạt động ca làm việc này?')) return;
    try {
      await deleteShiftConfig(id);
      loadShiftConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline/10 shadow-sm p-6 mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-on-surface mb-1">Quản lý Danh mục Ca làm việc (Enterprise Shift Settings)</h2>
        <p className="text-sm text-on-surface-variant">
          Các ca làm việc được cấu hình ở đây sẽ hiển thị lên Dropdown chọn ca cho thu ngân tại màn hình bán hàng POS.
        </p>
      </div>

      {/* Bảng danh sách Ca */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm text-left border border-outline/10 rounded-xl overflow-hidden">
          <thead className="bg-outline/5 text-on-surface font-semibold text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Tên Ca làm việc</th>
              <th className="px-4 py-3">Giờ bắt đầu</th>
              <th className="px-4 py-3">Giờ kết thúc</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/10 text-on-surface">
            {shiftConfigs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-on-surface-variant text-xs">
                  Chưa có ca làm việc nào được khởi tạo.
                </td>
              </tr>
            ) : (
              shiftConfigs.map((cfg) => (
                <tr key={cfg.id} className="hover:bg-outline/5">
                  <td className="px-4 py-3 font-semibold text-primary">{cfg.name}</td>
                  <td className="px-4 py-3 font-medium">{cfg.startTime.substring(0, 5)}</td>
                  <td className="px-4 py-3 font-medium">{cfg.endTime.substring(0, 5)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteShift(cfg.id)}
                      className="text-xs font-semibold text-error hover:underline"
                    >
                      Ngưng hoạt động
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Thêm ca mới */}
      <form onSubmit={handleAddShift} className="bg-outline/5 p-4 rounded-xl border border-outline/10 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-on-surface">Thêm Ca làm việc mới</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">Tên ca</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-outline/20 bg-surface text-sm text-on-surface focus:outline-none focus:border-primary"
              value={newShiftName}
              onChange={(e) => setNewShiftName(e.target.value)}
              placeholder="VD: Ca gãy, Ca Tết..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">Giờ bắt đầu</label>
            <input
              type="time"
              className="w-full h-10 px-3 rounded-lg border border-outline/20 bg-surface text-sm text-on-surface focus:outline-none focus:border-primary"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">Giờ kết thúc</label>
            <input
              type="time"
              className="w-full h-10 px-3 rounded-lg border border-outline/20 bg-surface text-sm text-on-surface focus:outline-none focus:border-primary"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang thêm...' : '+ Thêm ca làm việc'}
          </button>
        </div>
      </form>
    </div>
  );
}
