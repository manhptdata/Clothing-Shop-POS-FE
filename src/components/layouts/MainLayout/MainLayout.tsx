import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  return (
    <div className="font-body-md text-body-md text-on-surface antialiased bg-surface min-h-screen flex">
      <div data-sidebar>
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <div data-header>
          <Header />
        </div>
        <main className="flex-1 p-8 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
