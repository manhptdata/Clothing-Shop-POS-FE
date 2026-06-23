import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export default function AdminRoute() {
  const user = useAppSelector((state) => state.auth.user);

  if (user?.role !== 'ADMIN') {
    // Chuyển về dashboard nếu không có quyền
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
