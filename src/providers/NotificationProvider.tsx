import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/redux/hooks';
import axiosInstance from '@/config/axiosInstance';
import { ENV } from '@/config/env';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'APPROVAL_REQUEST' | 'SHIFT_HANDOVER' | 'SYSTEM' | 'ORDER_CREATED' | 'ORDER_PAID';
  targetRole?: string;
  targetUserId?: number;
  read: boolean;
  createdAt: string;
  metadata?: string;
}

export interface ShiftHandoverItem {
  id: number;
  cashierUsername: string;
  shiftName: string;
  systemAmount: number;
  actualAmount: number;
  discrepancy: number;
  note?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  sendApprovalRequest: (orderNumber: string, reason: string) => Promise<void>;
  approveRequest: (id: number) => Promise<void>;
  rejectRequest: (id: number) => Promise<void>;
  submitShiftHandover: (data: { shiftName: string; systemAmount: number; actualAmount: number; note?: string }) => Promise<ShiftHandoverItem>;
  fetchHandoverHistory: () => Promise<ShiftHandoverItem[]>;
  fetchSystemAmount: () => Promise<number>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.accessToken);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axiosInstance.get<NotificationItem[]>('notifications');
      // Axios response standard might wrap with API response data. Let's handle both
      const data = (res.data as any).data || res.data;
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, [isAuthenticated]);

  const markRead = async (id: number) => {
    try {
      await axiosInstance.put(`notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const markAllRead = async () => {
    try {
      await axiosInstance.put('notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('Đã đọc tất cả thông báo');
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const sendApprovalRequest = async (orderNumber: string, reason: string) => {
    try {
      await axiosInstance.post('notifications/approval-request', { orderNumber, reason });
      toast.success('Đã gửi yêu cầu phê duyệt tới quản lý');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể gửi yêu cầu phê duyệt');
      throw e;
    }
  };

  const approveRequest = async (id: number) => {
    try {
      await axiosInstance.post(`notifications/approval-request/${id}/approve`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, title: 'Đã phê duyệt HỦY đơn' } : n))
      );
      toast.success('Đã phê duyệt hủy hóa đơn thành công');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể phê duyệt');
    }
  };

  const rejectRequest = async (id: number) => {
    try {
      await axiosInstance.post(`notifications/approval-request/${id}/reject`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, title: 'Đã từ chối HỦY đơn' } : n))
      );
      toast.success('Đã từ chối yêu cầu thành công');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể từ chối');
    }
  };

  const submitShiftHandover = async (data: { shiftName: string; systemAmount: number; actualAmount: number; note?: string }) => {
    try {
      const res = await axiosInstance.post<ShiftHandoverItem>('shifts/handover', data);
      const result = (res.data as any).data || res.data;
      toast.success('Bàn giao ca thành công');
      return result;
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể bàn giao ca');
      throw e;
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await axiosInstance.delete(`notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Đã xóa thông báo');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể xóa thông báo');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axiosInstance.delete('notifications');
      setNotifications([]);
      toast.success('Đã xóa tất cả thông báo');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể xóa tất cả thông báo');
    }
  };

  const fetchHandoverHistory = async () => {
    try {
      const res = await axiosInstance.get<ShiftHandoverItem[]>('shifts/history');
      return (res.data as any).data || res.data;
    } catch (e) {
      console.error('Failed to fetch handover history', e);
      return [];
    }
  };

  const fetchSystemAmount = async () => {
    try {
      const res = await axiosInstance.get<number>('shifts/system-amount');
      return (res.data as any).data !== undefined ? (res.data as any).data : res.data;
    } catch (e) {
      console.error('Failed to fetch system amount', e);
      return 0;
    }
  };

  // Setup EventSource for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      setNotifications([]);
      return;
    }

    // Fetch notifications ban đầu
    fetchNotifications();

    const url = `${ENV.API_BASE_URL}/api/notifications/subscribe?token=${token}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('CONNECT', (e) => {
      console.log('SSE Connected:', e.data);
    });

    eventSource.addEventListener('notification', (e) => {
      try {
        const newNotif: NotificationItem = JSON.parse(e.data);
        setNotifications((prev) => {
          // Tránh bị trùng lặp thông báo
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });

        // Hiển thị Toast động
        showToast(newNotif);
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('SSE connection encountered an error. Browser will auto-reconnect...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated, user, token, fetchNotifications]);

  // Hàm sinh Toast cực chất và chuyên nghiệp
  const showToast = (notif: NotificationItem) => {
    const isApproveRequest = notif.type === 'APPROVAL_REQUEST';
    const isAdmin = user?.role === 'ROLE_ADMIN';

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-surface shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-outline/10 overflow-hidden backdrop-blur-lg bg-surface/95`}
        >
          <div className="p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {notif.type === 'LOW_STOCK' && (
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">warning</span>
                </div>
              )}
              {notif.type === 'APPROVAL_REQUEST' && (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">rule</span>
                </div>
              )}
              {notif.type === 'SHIFT_HANDOVER' && (
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
              )}
              {notif.type === 'SYSTEM' && (
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">info</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">{notif.title}</p>
              <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">{notif.message}</p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-outline/10 text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          {/* Hộp hành động nếu là Approval Request dành cho Admin */}
          {isApproveRequest && isAdmin && (
            <div className="flex border-t border-outline/10 bg-outline/5">
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  await approveRequest(notif.id);
                }}
                className="flex-1 py-3 px-4 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors border-r border-outline/10 text-center"
              >
                Phê duyệt
              </button>
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  await rejectRequest(notif.id);
                }}
                className="flex-1 py-3 px-4 text-xs font-semibold text-rose-500 hover:bg-rose-500/5 transition-colors text-center"
              >
                Từ chối
              </button>
            </div>
          )}
        </div>
      ),
      {
        duration: isApproveRequest && isAdmin ? 15000 : 5000,
        position: 'top-right',
      }
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markRead,
        markAllRead,
        sendApprovalRequest,
        approveRequest,
        rejectRequest,
        submitShiftHandover,
        fetchHandoverHistory,
        fetchSystemAmount,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
