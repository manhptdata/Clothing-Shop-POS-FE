import { useAppDispatch } from '@/redux/hooks';
import { logoutThunk } from '@/redux/slice/authSlice';

export default function Header() {
  const dispatch = useAppDispatch();

  return (
    <header className="flex justify-between items-center h-20 px-8 bg-surface/80 backdrop-blur-md border-b border-outline/10 sticky top-0 z-30">
      <div className="flex items-center w-96 relative">
        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-outline/20 focus:border-primary focus:outline-none focus:ring-0 font-body-sm text-body-sm transition-colors"
          placeholder="Tìm kiếm..."
          type="text"
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase hidden md:inline-block">
          Chi nhánh: Trung tâm
        </span>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors scale-98 active:scale-95 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            notifications
          </span>
        </button>
        <div className="h-6 w-px bg-outline/20 mx-2"></div>
        <button
          onClick={() => dispatch(logoutThunk())}
          className="font-button text-button text-primary hover:opacity-80 transition-opacity scale-98 active:scale-95 transition-transform flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
