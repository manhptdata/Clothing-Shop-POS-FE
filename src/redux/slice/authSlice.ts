import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/redux/api/authApi';
import type { AuthState } from '@/types/auth.types';

const savedUser = localStorage.getItem('user');
let parsedUser = null;
try {
  if (savedUser && savedUser !== 'undefined') {
    parsedUser = JSON.parse(savedUser);
  }
} catch (e) {
  console.error('Failed to parse user from localStorage', e);
}

const initialState: AuthState = {
  user: parsedUser,
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('access_token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data;
        const token = data.access_token || data.accessToken || '';
        state.accessToken = token;
        state.user = data.user;
        state.isAuthenticated = true;
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.data?.message || 'Đăng nhập thất bại';
      })
      // Get Account
      .addMatcher(authApi.endpoints.getAccount.matchFulfilled, (state, action) => {
        const user = action.payload.data.user;
        state.user = user;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addMatcher(authApi.endpoints.getAccount.matchRejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      })
      // Logout
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
