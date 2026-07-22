import React, { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { ROLE_LABEL } from '@/utils/constants';
import { useGetSecurityPinQuery, useChangeSecurityPinMutation, useChangePasswordMutation } from '@/redux/api/userApi';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

export default function UserProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  
  const isManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';
  const { data: pinData, refetch: refetchPin } = useGetSecurityPinQuery(undefined, { skip: !isManager });
  const [changePin, { isLoading: isChangingPin }] = useChangeSecurityPinMutation();

  const [showPin, setShowPin] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');

  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword }).unwrap();
      toast.success('Đổi mật khẩu thành công!');
      setIsPasswordModalOpen(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6) {
      toast.error('Mã PIN phải gồm 6 chữ số');
      return;
    }
    try {
      await changePin({ pin: newPin }).unwrap();
      toast.success('Đổi mã PIN thành công!');
      setIsEditModalOpen(false);
      setNewPin('');
      refetchPin();
    } catch (error: any) {
      toast.error(error.data?.message || 'Lỗi khi đổi mã PIN');
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Hồ sơ của tôi</h1>
      
      <div className="bg-surface rounded-2xl shadow-sm border border-outline/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary to-[#18754a]"></div>
        
        {/* Profile Content */}
        <div className="px-6 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-surface bg-white shadow-md text-primary flex items-center justify-center font-bold text-4xl bg-gradient-to-tr from-primary/10 to-transparent">
              {user.fullName.split(' ').pop()?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
            </div>
            <div className="px-4 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
              {ROLE_LABEL[user.role] || user.role.replace(/^ROLE_/, '').replace(/_/g, ' ')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface border-b border-outline/10 pb-2">Thông tin chung</h3>
              
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Họ và tên</p>
                <p className="text-base font-medium text-on-surface">{user.fullName}</p>
              </div>

              <div>
                <p className="text-sm text-on-surface-variant mb-1">Tên đăng nhập</p>
                <p className="text-base font-medium text-on-surface">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface border-b border-outline/10 pb-2">Thông tin liên hệ</h3>
              
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Email</p>
                <p className="text-base font-medium text-on-surface">
                  {user.email ? user.email : <span className="text-outline italic">Chưa cập nhật</span>}
                </p>
              </div>

              <div>
                <p className="text-sm text-on-surface-variant mb-1">Số điện thoại</p>
                <p className="text-base font-medium text-on-surface">
                  {user.phone ? user.phone : <span className="text-outline italic">Chưa cập nhật</span>}
                </p>
              </div>
              {isManager && (
                <div>
                  <p className="text-sm text-on-surface-variant mb-1">Mã PIN duyệt trả hàng</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-xl border border-outline/10">
                      <span className="text-sm font-semibold tracking-wide text-primary mr-3">
                        {showPin ? ((pinData?.data as any)?.hasPin ? 'Đã cài đặt' : 'Chưa cài đặt') : '••••••'}
                      </span>
                      <button 
                        onClick={() => setShowPin(!showPin)}
                        className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                        title={showPin ? "Ẩn trạng thái PIN" : "Hiện trạng thái PIN"}
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPin ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Đổi mã PIN
                    </button>
                  </div>
                </div>
              )}
              <div>
                 <p className="text-sm text-on-surface-variant mb-1">Mật khẩu</p>
                 <button 
                   onClick={() => setIsPasswordModalOpen(true)}
                   className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2.5 rounded-xl transition-colors"
                 >
                   Đổi mật khẩu
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Đổi Mã PIN */}
      {isEditModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-outline/10 max-w-sm w-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-outline/10 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Đổi Mã PIN Duyệt</h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setNewPin('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleChangePin} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-2">Nhập 6 số mã PIN mới</label>
                <input 
                  type="text"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl tracking-[0.3em] font-mono font-bold text-primary bg-surface-container-lowest border border-outline/20 rounded-xl py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="------"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                disabled={isChangingPin || newPin.length !== 6}
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPin ? 'Đang cập nhật...' : 'Xác nhận đổi mã'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Đổi Mật khẩu */}
      {isPasswordModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-outline/10 max-w-sm w-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-outline/10 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Đổi mật khẩu</h3>
              <button 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Mật khẩu hiện tại</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  className="w-full text-base bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nhập mật khẩu hiện tại"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Mật khẩu mới</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full text-base bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Xác nhận mật khẩu</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full text-base bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <button 
                type="submit"
                disabled={isChangingPassword || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isChangingPassword ? 'Đang cập nhật...' : 'Xác nhận'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
