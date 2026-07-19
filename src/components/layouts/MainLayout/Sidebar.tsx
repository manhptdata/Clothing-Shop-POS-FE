import { useState, useEffect } from 'react';
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
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Tổng quan', icon: 'dashboard', permissions: ['VIEW_REPORT'] },
  { 
    path: '#orders', label: 'Đơn hàng', icon: 'shopping_bag', permissions: ['VIEW_ORDER', 'CREATE_ORDER'],
    children: [
      { path: '/orders/new', label: 'Bán hàng (POS)', icon: 'point_of_sale', permissions: ['CREATE_ORDER'] },
      { path: '/orders', label: 'Danh sách đơn hàng', icon: 'receipt_long', permissions: ['VIEW_ORDER'] },
      { path: '/orders/payment-logs', label: 'Lịch sử thanh toán QR', icon: 'qr_code_scanner', permissions: ['VIEW_ORDER'] },
    ]
  },
  {
    path: '#products', label: 'Sản phẩm', icon: 'inventory_2', permissions: ['VIEW_PRODUCT', 'VIEW_CATEGORY'],
    children: [
      { path: '/products', label: 'Danh sách sản phẩm', icon: 'list_alt', permissions: ['VIEW_PRODUCT'] },
      { path: '/products/categories', label: 'Danh mục', icon: 'category', permissions: ['VIEW_CATEGORY'] },
    ]
  },
  {
    path: '#customers', label: 'Khách hàng', icon: 'group', permissions: ['VIEW_CUSTOMER', 'VIEW_CAMPAIGN'],
    children: [
      { path: '/customers', label: 'Danh sách khách hàng', icon: 'recent_actors', permissions: ['VIEW_CUSTOMER'] },
      { path: '/customers/groups', label: 'Nhóm khách hàng', icon: 'loyalty', permissions: ['VIEW_CUSTOMER'] },
      { path: '/customers/groups/vouchers', label: 'Quản lý Voucher', icon: 'local_activity', permissions: ['VIEW_CUSTOMER'] },
      { path: '/customers/care/history', label: 'Chăm sóc khách hàng', icon: 'support_agent', permissions: ['VIEW_CAMPAIGN'] },
    ]
  },
  {
    path: '#warehouse', label: 'Kho hàng', icon: 'warehouse', permissions: ['VIEW_RECEIPT', 'VIEW_SUPPLIER'],
    children: [
      { path: '/warehouse/receipts', label: 'Nhập kho', icon: 'input', permissions: ['VIEW_RECEIPT'] },
      { path: '/warehouse/stock-history', label: 'Lịch sử kho', icon: 'history', permissions: ['VIEW_RECEIPT'] },
      { path: '/suppliers', label: 'Nhà cung cấp', icon: 'local_shipping', permissions: ['VIEW_SUPPLIER'] },
    ]
  },
  {
    path: '#users', label: 'Nhân sự', icon: 'admin_panel_settings', permissions: ['MANAGE_USER', 'MANAGE_ROLE', 'VIEW_SHIFT'],
    children: [
      { path: '/users', label: 'Nhân viên', icon: 'badge', permissions: ['MANAGE_USER'] },
      { path: '/settings/roles', label: 'Vai trò', icon: 'security', permissions: ['MANAGE_ROLE'] },
      { path: '/shifts/history', label: 'Lịch sử giao ca', icon: 'history_toggle_off', permissions: ['VIEW_SHIFT'] },
    ]
  },
  {
    path: '#settings', label: 'Thiết lập', icon: 'settings', permissions: ['MANAGE_ROLE'], // MANAGE_ROLE is typically admin-level
    children: [
      { path: '/settings/general', label: 'Cấu hình chung', icon: 'settings_applications', permissions: ['MANAGE_ROLE'] },
    ]
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const [logout] = useLogoutMutation();
  const user = useAppSelector((state) => state.auth.user);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    const currentOpenGroups: string[] = [];
    menuItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => 
          child.path === '/products'
            ? location.pathname === '/products' || (location.pathname.startsWith('/products/') && !location.pathname.startsWith('/products/categories'))
            : child.path === '/orders'
              ? location.pathname === '/orders' || (location.pathname.startsWith('/orders/') && !location.pathname.includes('/new'))
            : location.pathname.startsWith(child.path)
        );
        if (isChildActive && !currentOpenGroups.includes(item.path)) {
          currentOpenGroups.push(item.path);
        }
      }
    });
    setOpenGroups(prev => Array.from(new Set([...prev, ...currentOpenGroups])));
  }, [location.pathname]);

  if (!user) return null;

  const userPerms = user.permissions || [];
  const isAdmin = user.role === 'ROLE_ADMIN';

  const hasPermission = (permissions: string[]) => {
    return isAdmin || permissions.some(p => userPerms.includes(p));
  };

  const toggleGroup = (path: string) => {
    setOpenGroups(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <nav className={`fixed top-0 h-full flex flex-col py-8 w-64 border-r border-outline/5 bg-surface z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:left-0`}>
      <div className="px-6 mb-12 flex flex-col items-start">
        <h1 className="font-sans text-[42px] font-bold text-primary tracking-tight leading-none mb-1">Sapo</h1>
        <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest opacity-80">
          {ROLE_LABEL[user.role] || user.role.replace(/^ROLE_/, '').replace(/_/g, ' ')}
        </p>
      </div>
      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!hasPermission(item.permissions)) return null;

          if (item.children) {
            // Lọc menu con theo quyền
            const filteredChildren = item.children.filter(child => hasPermission(child.permissions));
            if (filteredChildren.length === 0) return null;
            
            const isGroupOpen = openGroups.includes(item.path);
            const isChildActive = filteredChildren.some(child => 
              child.path === '/products'
                ? location.pathname === '/products' || (location.pathname.startsWith('/products/') && !location.pathname.startsWith('/products/categories'))
                : location.pathname.startsWith(child.path)
            );

            return (
              <div key={item.path} className="mb-1">
                <button
                  onClick={() => toggleGroup(item.path)}
                  className={`flex w-full items-center justify-between px-4 py-3 rounded-lg hover-lift transition-all duration-300 group ${
                    isChildActive && !isGroupOpen
                    ? 'bg-primary/5 text-primary' 
                    : 'text-on-surface hover:bg-surface-container-high/50 hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110 ${isChildActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`}
                      style={{ fontVariationSettings: isChildActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span className={`font-medium ${isChildActive ? 'font-semibold' : ''}`}>{item.label}</span>
                  </div>
                  <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isGroupOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                
                {/* Danh sách con */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isGroupOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pl-10 pr-2 space-y-1 border-l-2 border-outline/10 ml-5 py-1">
                    {(() => {
                      const activeChild = filteredChildren.reduce((best, curr) => {
                        let match = false;
                        if (curr.path === '/products') match = location.pathname === '/products' || (location.pathname.startsWith('/products/') && !location.pathname.startsWith('/products/categories'));
                        else if (curr.path === '/orders') match = location.pathname === '/orders' || (location.pathname.startsWith('/orders/') && !location.pathname.includes('/new'));
                        else match = location.pathname.startsWith(curr.path);
                        if (match && (!best || curr.path.length > best.path.length)) return curr;
                        return best;
                      }, null as any);

                      return filteredChildren.map(child => {
                        const isActive = activeChild && activeChild.path === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                              ? 'bg-gradient-to-r from-primary to-[#18754a] text-on-primary shadow-md'
                              : 'text-on-surface-variant hover:bg-surface-container-high/50 hover:text-primary'
                              }`}
                          >
                            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-primary'}`}>
                              {child.icon}
                            </span>
                            <span className={`text-[13px] font-medium ${isActive ? 'font-semibold' : ''}`}>{child.label}</span>
                          </Link>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            );
          }

          const isActive = item.path === '/products'
            ? location.pathname === '/products' || (location.pathname.startsWith('/products/') && !location.pathname.startsWith('/products/categories'))
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
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
      <div className="px-4 mt-auto pt-4 border-t border-outline/5">
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
    </>
  );
}
