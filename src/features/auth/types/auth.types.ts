export type RoleEnum = 'ADMIN' | 'MANAGER' | 'STAFF';

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
