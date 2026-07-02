import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isPosPage = location.pathname === '/orders/new';

  return (
    <div className="font-body-md text-body-md text-on-surface antialiased bg-surface min-h-screen">
      <div data-sidebar>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      <div className="lg:ml-64 flex flex-col min-h-screen overflow-hidden">
        {!isPosPage && (
          <div data-header>
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
          </div>
        )}
        <main className={`flex-1 bg-surface ${isPosPage ? 'p-0' : 'p-4 lg:p-8'} overflow-hidden`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
