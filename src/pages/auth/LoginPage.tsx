import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useLoginMutation } from '@/redux/api/authApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getDefaultRouteForRole } from '@/router/RoleRoute';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { error } = useAppSelector((state) => state.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      const res = await login({ username: email, password }).unwrap();
      const userRole = res?.data?.user?.role;
      if (userRole) {
        navigate(getDefaultRouteForRole(userRole));
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setLocalError(err?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline/10 p-lg flex flex-col">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-xl">
            <div className="h-12 w-12 bg-primary-container text-on-primary-container rounded-none flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                diamond
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-primary tracking-tighter mb-xs text-center">Atelier</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center uppercase tracking-widest">
              Quản lý cửa hàng cao cấp
            </p>
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <div className="mb-md p-sm bg-error-container/20 border border-error/50 text-error text-body-sm font-body-sm flex items-center gap-xs rounded">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Form Section */}
          <form className="flex flex-col gap-md" onSubmit={handleLogin}>
            <Input
              id="email"
              label="Tài khoản / Email"
              type="text"
              placeholder="associate@atelier.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="rounded-none"
            />

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-caps text-label-caps text-on-surface" htmlFor="password">
                  Mật khẩu
                </label>
                <a className="font-label-caps text-label-caps text-secondary-container hover:opacity-80 transition-opacity" href="#">
                  Quên mật khẩu?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="rounded-none"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="mt-sm w-full py-sm rounded-none bg-primary-container text-on-primary-container hover:bg-primary-container/90"
              isLoading={isLoading}
              rightIcon={!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-lg pt-md border-t border-t-outline/10 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Chỉ dành cho nhân viên nội bộ. <br />
              <a className="text-primary hover:underline underline-offset-4 decoration-1" href="#">
                Liên hệ hỗ trợ
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
