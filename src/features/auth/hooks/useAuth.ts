import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginThunk, logoutThunk, clearError } from '../store/authSlice';
import type { LoginRequest } from '../types/auth.types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginRequest) => {
    const result = await dispatch(loginThunk(credentials));
    if (loginThunk.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const logout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return {
    user, accessToken, isAuthenticated, isLoading, error,
    login, logout, clearError: () => dispatch(clearError()),
  };
}
