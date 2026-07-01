import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useEffect, useState } from 'react';
import { useLazyGetAccountQuery } from '@/redux/api/authApi';
import { getDefaultRouteForPermissions } from './PermissionRoute';

export default function RoleRoute() {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(!user && isAuthenticated);
  const [triggerGetAccount] = useLazyGetAccountQuery();

  useEffect(() => {
    if (!user && isAuthenticated) {
      triggerGetAccount()
        .unwrap()
        .finally(() => {
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, [user, isAuthenticated, triggerGetAccount]);

  if (isInitializing || isLoading) {
    return <div className="flex items-center justify-center h-screen bg-background text-on-background">Đang tải thông tin người dùng...</div>;
  }

  if (!user && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * Trả về route mặc định cho user dựa trên permissions từ JWT token.
 * Admin (ROLE_ADMIN) luôn về /dashboard.
 */
export const getDefaultRouteForRole = (role: string, permissions: string[] = []): string => {
  if (role === 'ROLE_ADMIN') return '/dashboard';
  return getDefaultRouteForPermissions(permissions);
};
