import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/api/authApi';
import ShiftHandoverModal from '@/components/ui/ShiftHandoverModal';
import { ROLE_LABEL } from '@/utils/constants';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  permissions: string[];
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Tổng quan', icon: 'dashboard', permissions: ['VIEW_REPORT'] },
  { path: '/orders', label: 'Đơn hàng', icon: 'shopping_bag', permissions: ['VIEW_ORDER', 'CREATE_ORDER'] },
  { path: '/products', label: 'Sản phẩm', icon: 'inventory_2', permissions: ['VIEW_PRODUCT'] },
  { path: '/products/categories', label: 'Danh mục', icon: 'category', permissions: ['VIEW_CATEGORY'] },
  { path: '/suppliers', label: 'Nhà cung cấp', icon: 'local_shipping', permissions: ['VIEW_SUPPLIER'] },
  { path: '/warehouse/receipts', label: 'Nhập kho', icon: 'input', permissions: ['VIEW_RECEIPT'] },
  { path: '/warehouse/stock-history', label: 'Lịch sử kho', icon: 'history', permissions: ['VIEW_RECEIPT'] },
  { path: '/customers', label: 'Khách hàng', icon: 'group', permissions: ['VIEW_CUSTOMER', 'VIEW_CAMPAIGN'] },
  { path: '/shifts/history', label: 'Lịch sử giao ca', icon: 'history_toggle_off', permissions: ['VIEW_SHIFT'] },
  { path: '/users', label: 'Nhân viên', icon: 'badge', permissions: ['MANAGE_USER'] },
  { path: '/settings/roles', label: 'Vai trò', icon: 'security', permissions: ['MANAGE_ROLE'] },
];

export default function Sidebar() {
  const location = useLocation();
  const [logout] = useLogoutMutation();
  const user = useAppSelector((state) => state.auth.user);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  if (!user) return null;

  const userPerms = user.permissions || [];
  const isAdmin = user.role === 'ROLE_ADMIN';

  const filteredMenu = menuItems.filter((item) =>
    isAdmin || item.permissions.some(p => userPerms.includes(p))
  );

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col py-8 w-64 border-r border-outline/5 glass-panel z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="px-6 mb-12 flex flex-col items-start">
        <h1 className="font-sans text-[42px] font-bold text-primary tracking-tight leading-none mb-1">Sapo</h1>
        <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest opacity-80">
          {ROLE_LABEL[user.role] || user.role.replace(/^ROLE_/, '').replace(/_/g, ' ')}
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
        {(isAdmin || userPerms.includes('MANAGE_SHIFT') || userPerms.includes('CREATE_ORDER')) && (
          <button
            onClick={() => setIsHandoverOpen(true)}
            className="flex w-full items-center gap-3 px-4 py-3 mb-2 text-on-surface hover:bg-outline/5 rounded-lg hover-lift transition-all duration-300 group"
          >
            <span className="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110 text-on-surface-variant group-hover:text-primary">
              account_balance_wallet
            </span>
            <span className="font-medium">Bàn giao ca</span>
          </button>
        )}
        <div className="h-px w-full bg-outline/10 my-4"></div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg hover-lift transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110">logout</span>
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>

      <ShiftHandoverModal isOpen={isHandoverOpen} onClose={() => setIsHandoverOpen(false)} />
    </nav>
  );
}
