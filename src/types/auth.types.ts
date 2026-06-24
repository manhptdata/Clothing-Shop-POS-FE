export type RoleEnum = 'ROLE_ADMIN' | 'ROLE_SALE' | 'ROLE_CS' | 'ROLE_WH';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserLogin {
  id: number;
  username: string;
  fullName: string;
  role: RoleEnum;
}

export interface LoginResponse {
  accessToken: string;
  user: UserLogin;
}

export interface AuthState {
  user: UserLogin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
