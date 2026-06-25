import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { RoleEnum } from '@/types/auth.types';
import { useEffect, useState } from 'react';
import { useLazyGetAccountQuery } from '@/redux/api/authApi';

export const getDefaultRouteForRole = (role: RoleEnum): string => {
  switch (role) {
    case 'ROLE_ADMIN':
    case 'ROLE_SALE':
      return '/dashboard';
    case 'ROLE_CS':
      return '/customers';
    case 'ROLE_WH':
      return '/products';
    default:
      return '/login';
  }
};

interface RoleRouteProps {
  allowedRoles: RoleEnum[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
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

  if (user && !allowedRoles.includes(user.role)) {
    // Chuyển hướng động về trang chủ tương ứng của vai trò
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
}
