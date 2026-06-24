import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/config/api';
import type { AuthState, LoginRequest, UserLogin } from '@/types/auth.types';

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

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const getAccountThunk = createAsyncThunk(
  'auth/getAccount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getAccount();
      return res.data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy thông tin');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('access_token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('access_token', action.payload.accessToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getAccountThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(logoutThunk.fulfilled, (state) => {
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
