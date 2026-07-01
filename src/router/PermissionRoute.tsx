import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useEffect, useState, lazy } from 'react';
import { useLazyGetAccountQuery } from '@/redux/api/authApi';

const ForbiddenPage = lazy(() => import('@/pages/errors/ForbiddenPage'));

export const getDefaultRouteForPermissions = (permissions: string[] = [], roleName: string = ''): string => {
  if (roleName === 'ROLE_ADMIN' || permissions.includes('VIEW_REPORT')) return '/dashboard';
  if (permissions.includes('CREATE_ORDER')) return '/orders/new';
  if (permissions.includes('VIEW_ORDER')) return '/orders';
  if (permissions.includes('VIEW_CUSTOMER')) return '/customers';
  if (permissions.includes('VIEW_PRODUCT')) return '/products';
  if (permissions.includes('VIEW_RECEIPT')) return '/warehouse/receipts';
  return '/login';
};

interface PermissionRouteProps {
  allowedPermissions?: string[];
}

export default function PermissionRoute({ allowedPermissions = [] }: PermissionRouteProps) {
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

  // ROLE_ADMIN luôn có full quyền
  if (allowedPermissions.length > 0) {
    const userPermissions = user?.permissions || [];
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const hasPermission = isAdmin || allowedPermissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
}
