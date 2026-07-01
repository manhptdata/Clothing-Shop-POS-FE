import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { getDefaultRouteForPermissions } from '@/router/PermissionRoute';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleGoHome = () => {
    const permissions = user?.permissions || [];
    const role = user?.role || '';
    const defaultRoute = getDefaultRouteForPermissions(permissions, role);
    navigate(defaultRoute, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">

        {/* Animated 404 Number */}
        <div className="relative mb-8 select-none">
          <div className="text-[10rem] font-black leading-none tracking-tighter" style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, rgba(27,138,84,0.2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            404
          </div>
          {/* Floating Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
              <span className="material-symbols-outlined text-primary text-5xl">search_off</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-3 tracking-tight">
            Trang không tồn tại
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            Xin lỗi! Trang bạn đang tìm kiếm không tồn tại, đã bị di chuyển hoặc địa chỉ URL bị nhập sai.
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/30"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Về trang chủ
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-outline/30 text-on-surface rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-surface-container hover:border-outline/60 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-on-surface-variant/50 text-xs">
          Mã lỗi: <span className="font-mono font-semibold">HTTP 404 Not Found</span>
        </p>
      </div>
    </div>
  );
}
