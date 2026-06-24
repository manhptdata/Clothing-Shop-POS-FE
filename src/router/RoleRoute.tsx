import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { RoleEnum } from '@/types/auth.types';
import { useEffect, useState } from 'react';
import { getAccountThunk } from '@/redux/slice/authSlice';

interface RoleRouteProps {
  allowedRoles: RoleEnum[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(!user && isAuthenticated);

  useEffect(() => {
    if (!user && isAuthenticated) {
      dispatch(getAccountThunk()).finally(() => {
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, [user, isAuthenticated, dispatch]);

  if (isInitializing || isLoading) {
    return <div className="flex items-center justify-center h-screen bg-background text-on-background">Đang tải thông tin người dùng...</div>;
  }

  if (!user && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Chuyển về dashboard nếu không có quyền
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
