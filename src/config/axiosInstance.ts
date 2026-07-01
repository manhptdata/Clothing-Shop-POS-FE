import axios from 'axios';
import { ENV } from '@/config/env';

// ─── Axios Instance ────────────────────────────────────────────────────────────
// - baseURL: ENV.API_BASE_URL/api/
// - withCredentials: true  (cần cho cookie refresh_token của BE)
// - Interceptor request: attach Bearer token từ localStorage
// - Interceptor response: tự động refresh token khi gặp 401

const axiosInstance = axios.create({
  baseURL: `${ENV.API_BASE_URL}/api/`,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const ACCESS_TOKEN_KEY = 'access_token';

// Request: đính Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response: auto-refresh khi 401, redirect 403
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi 403 - Không có quyền truy cập
    if (error.response?.status === 403) {
      if (!window.location.pathname.includes('/restricted') && !window.location.pathname.includes('/403')) {
        window.location.replace('/restricted');
      }
      return Promise.reject(error);
    }

    // Tránh vòng lặp vô tận: không tự động refresh token nếu request bị lỗi chính là login hoặc refresh
    const isAuthRequest = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/api/auth/refresh`, {
          withCredentials: true,
        });
        const newToken: string = res.data?.data?.access_token || res.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        // Tránh reload lại trang khi người dùng đang ở sẵn trang login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
