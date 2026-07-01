import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { getDefaultRouteForPermissions } from '@/router/PermissionRoute';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleGoHome = () => {
    const permissions = user?.permissions || [];
    const role = user?.role || '';
    const defaultRoute = getDefaultRouteForPermissions(permissions, role);
    navigate(defaultRoute, { replace: true });
  };

  return (
    <div className="w-full h-full min-h-[80vh] bg-background flex flex-col items-center justify-center p-6 rounded-2xl">
      <div className="max-w-lg w-full text-center">

        {/* Animated 403 Number */}
        <div className="relative mb-8 select-none">
          <div className="text-[10rem] font-black leading-none tracking-tighter" style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, rgba(245,158,11,0.2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            403
          </div>
          {/* Floating Lock Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center"
              style={{ animation: 'lockShake 4s ease-in-out infinite' }}
            >
              <span className="material-symbols-outlined text-amber-600 text-5xl">lock</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-3 tracking-tight">
            Không có quyền truy cập
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            Bạn không có quyền hạn để xem nội dung này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
          </p>
        </div>

        {/* Role info badge */}
        {user && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline/15 mb-8">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">badge</span>
            <span className="text-sm text-on-surface-variant">
              Tài khoản của bạn:{' '}
              <span className="font-semibold text-on-surface">{user.fullName}</span>
            </span>
          </div>
        )}

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-400/50"
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
          Mã lỗi: <span className="font-mono font-semibold">HTTP 403 Forbidden</span>
        </p>
      </div>

      <style>{`
        @keyframes lockShake {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-8deg); }
          20% { transform: rotate(8deg); }
          30% { transform: rotate(-5deg); }
          40% { transform: rotate(5deg); }
          50% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
