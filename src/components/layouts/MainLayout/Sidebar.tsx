import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { RoleEnum } from '@/types/auth.types';
import { useLogoutMutation } from '@/redux/api/authApi';

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
    roles: ['ROLE_ADMIN', 'ROLE_SALE'],
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
    path: '/products/categories',
    label: 'Danh mục',
    icon: 'category',
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
  const [logout] = useLogoutMutation();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col py-8 w-64 border-r border-outline/5 glass-panel z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="px-6 mb-12 flex flex-col items-start">
        <h1 className="font-serif text-[42px] font-bold text-primary tracking-tight leading-none mb-1">Atelier</h1>
        <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest opacity-80">
          {user.role === 'ROLE_ADMIN' && 'Quản trị viên'}
          {user.role === 'ROLE_SALE' && 'Bán hàng'}
          {user.role === 'ROLE_CS' && 'Chăm sóc khách hàng'}
          {user.role === 'ROLE_WH' && 'Quản lý kho'}
        </p>
      </div>
      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => {
          const isActive = item.path === '/products'
            ? location.pathname === '/products' || (location.pathname.startsWith('/products/') && !location.pathname.startsWith('/products/categories'))
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg hover-lift transition-all duration-300 group ${isActive
                  ? 'bg-gradient-to-r from-primary to-[#18754a] text-on-primary shadow-md'
                  : 'text-on-surface hover:bg-surface-container-high/50 hover:text-primary'
                }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-primary'}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="px-4 mt-auto">
        <div className="h-px w-full bg-outline/10 my-4"></div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg hover-lift transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110">logout</span>
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}
