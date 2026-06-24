import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { RoleEnum } from '@/types/auth.types';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  roles: RoleEnum[];
}

const menuItems: MenuItem[] = [
  {
    path: '/dashboard',
    label: 'Bảng điều khiển',
    icon: 'dashboard',
    roles: ['ROLE_ADMIN', 'ROLE_SALE', 'ROLE_CS', 'ROLE_WH'],
  },
  {
    path: '/orders',
    label: 'Đơn hàng',
    icon: 'shopping_bag',
    roles: ['ROLE_ADMIN', 'ROLE_SALE'],
  },
  {
    path: '/products',
    label: 'Sản phẩm',
    icon: 'inventory_2',
    roles: ['ROLE_ADMIN', 'ROLE_WH'],
  },
  {
    path: '/customers',
    label: 'Khách hàng',
    icon: 'group',
    roles: ['ROLE_ADMIN', 'ROLE_SALE', 'ROLE_CS'],
  },
  {
    path: '/users',
    label: 'Nhân viên',
    icon: 'badge',
    roles: ['ROLE_ADMIN'],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col py-8 w-64 border-r border-outline/10 bg-surface z-40">
      <div className="px-6 mb-12 flex flex-col items-start">
        <h1 className="font-display-lg text-display-lg text-primary tracking-tighter">Atelier</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {user.role === 'ROLE_ADMIN' && 'Quản trị viên'}
          {user.role === 'ROLE_SALE' && 'Bán hàng'}
          {user.role === 'ROLE_CS' && 'Chăm sóc khách hàng'}
          {user.role === 'ROLE_WH' && 'Quản lý kho'}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredMenu.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 py-3 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-primary font-bold border-l-4 border-primary pl-4 bg-surface-container-low'
                  : 'text-on-surface-variant pl-5 hover:text-primary hover:bg-surface-container-lowest'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-body-md text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto space-y-2 border-t border-outline/10 pt-6">
        <Link
          to="/settings"
          className="flex items-center gap-3 text-on-surface-variant pl-5 py-3 hover:text-primary transition-colors cursor-pointer duration-200"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md text-body-md">Cài đặt</span>
        </Link>
        <Link
          to="/support"
          className="flex items-center gap-3 text-on-surface-variant pl-5 py-3 hover:text-primary transition-colors cursor-pointer duration-200"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-md text-body-md">Hỗ trợ</span>
        </Link>
      </div>
    </nav>
  );
}
