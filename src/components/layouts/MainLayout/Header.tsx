import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useNotifications, NotificationItem } from '@/providers/NotificationProvider';
import toast from 'react-hot-toast';
import { useGenerateSecurityPinMutation } from '@/redux/api/userApi';
import { useLogoutMutation } from '@/redux/api/authApi';
import { ROLE_LABEL } from '@/utils/constants';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    approveRequest,
    rejectRequest,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [generatePin, { isLoading: isGenerating }] = useGenerateSecurityPinMutation();
  const [logout] = useLogoutMutation();
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleGeneratePin = async () => {
    try {
      const res = await generatePin().unwrap();
      setGeneratedPin(res.data?.pin || null);
      setIsPinModalVisible(true);
      setIsUserMenuOpen(false);
    } catch (error: any) {
      toast.error(error.data?.message || 'Có lỗi xảy ra khi tạo PIN');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Vừa xong';
      if (mins < 60) return `${mins} phút trước`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} giờ trước`;
      return new Date(dateStr).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await markRead(notif.id);
    }

    let meta: any = null;
    if (notif.metadata) {
      if (typeof notif.metadata === 'object') {
        meta = notif.metadata;
      } else if (typeof notif.metadata === 'string') {
        try {
          meta = JSON.parse(notif.metadata);
        } catch (e) {
          console.error('Failed to parse notification metadata', e);
        }
      }
    }

    setIsOpen(false);

    // 1. Direct navigation via metadata properties
    if (meta?.orderId) {
      navigate(`/orders/${meta.orderId}`);
      return;
    }
    if (meta?.productId) {
      navigate(`/products/${meta.productId}`);
      return;
    }
    if (meta?.receiptId) {
      navigate(`/warehouse/receipts/${meta.receiptId}`);
      return;
    }
    if (meta?.customerId) {
      navigate(`/customers`);
      return;
    }
    if (meta?.voucherId) {
      navigate(`/vouchers`);
      return;
    }
    if (meta?.returnId) {
      navigate(`/warehouse/damaged-items`);
      return;
    }
    if (meta?.handoverId) {
      navigate(`/shifts/history`);
      return;
    }
    if (meta?.variantId) {
      navigate(`/products`);
      return;
    }

    // 2. Fallback navigation based on notification type
    if (notif.type === 'ORDER_CREATED' || notif.type === 'ORDER_PAID' || notif.type === 'APPROVAL_REQUEST') {
      navigate('/orders');
      return;
    }
    if (notif.type === 'SHIFT_HANDOVER') {
      navigate('/shifts/history');
      return;
    }
    if (notif.type === 'LOW_STOCK' || (notif.type as any) === 'RETURN_ORDER') {
      navigate('/warehouse/damaged-items');
      return;
    }
    if ((notif.type as any) === 'NEW_CUSTOMER') {
      navigate('/customers');
      return;
    }
    if ((notif.type as any) === 'VOUCHER_CREATED') {
      navigate('/vouchers');
      return;
    }

    // 3. Fallback navigation based on Title/Message keywords
    const textContent = `${notif.title || ''} ${notif.message || ''}`.toLowerCase();
    if (textContent.includes('nhập kho') || textContent.includes('phiếu nhập')) {
      navigate('/warehouse/receipts');
      return;
    }
    if (textContent.includes('sản phẩm')) {
      navigate('/products');
      return;
    }
    if (textContent.includes('tồn kho') || textContent.includes('cảnh báo') || textContent.includes('trả hàng')) {
      navigate('/warehouse/damaged-items');
      return;
    }
    if (textContent.includes('khách hàng')) {
      navigate('/customers');
      return;
    }
    if (textContent.includes('voucher') || textContent.includes('mã giảm giá') || textContent.includes('khuyến mãi')) {
      navigate('/vouchers');
      return;
    }
  };

  return (
    <header className="flex justify-between lg:justify-end items-center h-20 px-4 md:px-8 bg-surface/80 backdrop-blur-md border-b border-outline/5 sticky top-0 z-30">
      {/* Hamburger Menu for Mobile */}
      <button 
        onClick={onMenuClick} 
        className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-outline/5 rounded-full flex items-center justify-center"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors scale-98 active:scale-95 transition-transform relative rounded-full hover:bg-outline/5"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Card */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-[300px] sm:w-80 md:w-96 bg-surface shadow-2xl rounded-2xl border border-outline/10 z-40 overflow-hidden flex flex-col max-h-[500px]">
              <div className="p-4 border-b border-outline/10 flex items-center justify-between bg-outline/5">
                <span className="font-semibold text-sm text-on-surface">Thông báo ({unreadCount})</span>
                <div className="flex gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Đọc tất cả
                    </button>
                  )}
                  {user?.role === 'ROLE_ADMIN' && notifications.length > 0 && (
                    <button
                      onClick={deleteAllNotifications}
                      className="text-xs font-semibold text-rose-500 hover:underline"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto flex-1 divide-y divide-outline/5">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-on-surface-variant/60">
                    Không có thông báo nào
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isApproveRequest = notif.type === 'APPROVAL_REQUEST';
                    const isAdmin = user?.role === 'ROLE_ADMIN';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 flex flex-col gap-2 transition-colors cursor-pointer group ${
                          notif.read ? 'hover:bg-outline/5' : 'bg-primary/5 hover:bg-primary/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {notif.type === 'LOW_STOCK' && (
                              <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
                            )}
                            {notif.type === 'APPROVAL_REQUEST' && (
                              <span className="material-symbols-outlined text-primary text-lg">rule</span>
                            )}
                            {notif.type === 'SHIFT_HANDOVER' && (
                              <span className="material-symbols-outlined text-rose-500 text-lg">account_balance_wallet</span>
                            )}
                            {notif.type === 'SYSTEM' && (
                              <span className="material-symbols-outlined text-blue-500 text-lg">info</span>
                            )}
                            {notif.type === 'ORDER_CREATED' && (
                              <span className="material-symbols-outlined text-blue-500 text-lg">shopping_bag</span>
                            )}
                            {notif.type === 'ORDER_PAID' && (
                              <span className="material-symbols-outlined text-green-600 text-lg">payments</span>
                            )}
                            {(notif.type as any) === 'NEW_CUSTOMER' && (
                              <span className="material-symbols-outlined text-indigo-500 text-lg">person_add</span>
                            )}
                            {(notif.type as any) === 'VOUCHER_CREATED' && (
                              <span className="material-symbols-outlined text-purple-500 text-lg">confirmation_number</span>
                            )}
                            {(notif.type as any) === 'RETURN_ORDER' && (
                              <span className="material-symbols-outlined text-orange-500 text-lg">assignment_return</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-on-surface truncate">{notif.title}</p>
                              {user?.role === 'ROLE_ADMIN' && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await deleteNotification(notif.id);
                                  }}
                                  className="text-on-surface-variant/40 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-outline/5 flex items-center justify-center"
                                  title="Xóa thông báo"
                                >
                                  <span className="material-symbols-outlined text-[16px] leading-none">delete</span>
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1 leading-normal break-words">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-on-surface-variant/60 mt-1.5">{formatTime(notif.createdAt)}</p>
                          </div>
                        </div>

                        {/* Thao tác phê duyệt trực tiếp trên bell dropdown */}
                        {isApproveRequest && isAdmin && !notif.read && (
                          <div className="flex gap-2 mt-1 ml-8">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await approveRequest(notif.id);
                              }}
                              className="flex-1 py-1.5 px-3 rounded-lg text-[10px] font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-colors text-center"
                            >
                              Phê duyệt
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await rejectRequest(notif.id);
                              }}
                              className="flex-1 py-1.5 px-3 rounded-lg text-[10px] font-semibold bg-rose-500 text-white hover:bg-rose-500/90 transition-colors text-center"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="relative flex items-center" ref={userMenuRef}>
            <div className="h-6 w-px bg-outline/20 mx-1 md:mx-2"></div>
            
            <div 
              className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-outline/5 p-1 rounded-xl transition-colors"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="text-right hidden md:block">
                <p className="font-semibold text-sm text-on-surface leading-tight">{user.fullName}</p>
                <p className="text-xs text-on-surface-variant/80">
                  {ROLE_LABEL[user.role] || user.role.replace(/^ROLE_/, '').replace(/_/g, ' ')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-[#18754a] text-on-primary flex items-center justify-center font-bold text-sm shadow-sm">
                {user.fullName.split(' ').pop()?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-surface rounded-2xl shadow-xl border border-outline/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-on-surface hover:bg-primary/5 hover:text-primary rounded-xl flex items-center gap-3 transition-colors group font-medium"
                  >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-colors">person</span>
                    Tài khoản của tôi
                  </button>

                  {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER') && (
                    <button
                      onClick={handleGeneratePin}
                      disabled={isGenerating}
                      className="w-full text-left px-3 py-2.5 text-sm text-on-surface hover:bg-primary/5 hover:text-primary rounded-xl flex items-center gap-3 transition-colors group font-medium"
                    >
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-colors">key</span>
                      {isGenerating ? 'Đang tạo...' : 'Tạo mã PIN duyệt'}
                    </button>
                  )}
                  
                  <div className="h-px bg-outline/10 my-1 mx-2"></div>

                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-3 py-2.5 text-sm text-error hover:bg-error/5 hover:text-error rounded-xl flex items-center gap-3 transition-colors group font-medium"
                  >
                    <span className="material-symbols-outlined text-[20px] text-error group-hover:text-error transition-colors">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isPinModalVisible && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-outline/10 max-w-sm w-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-md border-b border-outline/10 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Mã PIN duyệt trả hàng</h3>
              <button 
                onClick={() => {
                  setIsPinModalVisible(false);
                  setGeneratedPin(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-md text-center">
              <p className="mb-4 text-sm text-on-surface-variant">Mã PIN bảo mật mới của bạn là:</p>
              <div className="text-4xl font-bold text-primary tracking-[0.2em] mb-4 bg-primary/10 py-4 rounded-xl">
                {generatedPin}
              </div>
              <p className="text-xs text-rose-500 mb-0 font-medium bg-rose-50 p-3 rounded-lg text-left">
                * Lưu ý: Mã này chỉ hiển thị một lần. Vui lòng ghi nhớ để dùng khi phê duyệt các yêu cầu trả hàng của nhân viên.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
