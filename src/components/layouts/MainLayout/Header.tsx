import { useAppSelector } from '@/redux/hooks';

export default function Header() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="flex justify-end items-center h-20 px-8 bg-surface/80 backdrop-blur-md border-b border-outline/5 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors scale-98 active:scale-95 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            notifications
          </span>
        </button>
        {user && (
          <>
            <div className="h-6 w-px bg-outline/20 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="font-semibold text-sm text-on-surface leading-tight">{user.fullName}</p>
                <p className="text-xs text-on-surface-variant/80">
                  {user.role === 'ROLE_ADMIN' && 'Quản trị viên'}
                  {user.role === 'ROLE_SALE' && 'Bán hàng'}
                  {user.role === 'ROLE_CS' && 'Chăm sóc khách hàng'}
                  {user.role === 'ROLE_WH' && 'Quản lý kho'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-[#18754a] text-on-primary flex items-center justify-center font-bold text-sm shadow-sm">
                {user.fullName.split(' ').pop()?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
