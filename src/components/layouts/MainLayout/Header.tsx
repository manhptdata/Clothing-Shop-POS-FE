import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useNotifications, NotificationItem } from '@/providers/NotificationProvider';
import { ROLE_LABEL } from '@/utils/constants';

export default function Header() {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
    if (notif.metadata) {
      try {
        const meta = JSON.parse(notif.metadata);
        if (meta.orderId) {
          navigate(`/orders/${meta.orderId}`);
          setIsOpen(false);
        } else if (meta.handoverId) {
          navigate(`/shifts/history`);
          setIsOpen(false);
        } else if (meta.variantId) {
          navigate(`/products`);
          setIsOpen(false);
        }
      } catch (e) {
        console.error('Failed to parse notification metadata', e);
      }
    }
  };

  return (
    <header className="flex justify-end items-center h-20 px-8 bg-surface/80 backdrop-blur-md border-b border-outline/5 sticky top-0 z-30">
      <div className="flex items-center gap-4">
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
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface shadow-2xl rounded-2xl border border-outline/10 z-40 overflow-hidden flex flex-col max-h-[500px]">
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
          <>
            <div className="h-6 w-px bg-outline/20 mx-2"></div>
            <div className="flex items-center gap-3">
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
          </>
        )}
      </div>
    </header>
  );
}
