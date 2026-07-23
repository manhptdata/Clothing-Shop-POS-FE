// Role là string động từ DB - không hardcode cố định nữa
export type RoleEnum = string;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserLogin {
  id: number;
  username: string;
  fullName: string;
  phone?: string;
  email?: string;
  role: string;
  permissions?: string[];
}

export interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  user: UserLogin;
}

export interface AuthState {
  user: UserLogin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
