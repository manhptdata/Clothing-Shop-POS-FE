import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginThunk } from '@/redux/slice/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await dispatch(loginThunk({ username: email, password })).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
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
            {/* Email Field */}
            <div className="flex flex-col gap-base">
              <label className="font-label-caps text-label-caps text-on-surface" htmlFor="email">
                Tài khoản / Email
              </label>
              <input
                className="w-full bg-transparent border border-outline/20 font-body-md text-body-md p-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors rounded-none"
                id="email"
                placeholder="associate@atelier.com"
                required
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-base">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-label-caps text-on-surface" htmlFor="password">
                  Mật khẩu
                </label>
                <a className="font-label-caps text-label-caps text-secondary-container hover:opacity-80 transition-opacity" href="#">
                  Quên mật khẩu?
                </a>
              </div>
              <input
                className="w-full bg-transparent border border-outline/20 font-body-md text-body-md p-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors rounded-none"
                id="password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              className="mt-sm w-full bg-primary-container text-on-primary-container font-button text-button py-sm flex items-center justify-center gap-base transition-opacity hover:opacity-90 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
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
