// TODO: Implement MainLayout
// Compose Sidebar, Header và <Outlet /> (vùng hiển thị content của các route con)

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  return (
    <div>
      <Sidebar />
      <div>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
