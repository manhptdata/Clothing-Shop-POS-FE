import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { RoleEnum } from '@/types/auth.types';

interface RoleRouteProps {
  allowedRoles: RoleEnum[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Chuyển về dashboard nếu không có quyền
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
