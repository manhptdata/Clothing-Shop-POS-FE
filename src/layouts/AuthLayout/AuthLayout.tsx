// TODO: Implement AuthLayout
// Wrapper cho các trang liên quan đến Auth (VD: Login), thường căn giữa với logo

import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div>
      {/* TODO: Implement AuthLayout UI (background, logo, centered container) */}
      <Outlet />
    </div>
  );
}
