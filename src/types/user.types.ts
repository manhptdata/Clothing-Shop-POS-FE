import type { RoleEnum } from '@/types/auth.types';

export interface User {
  id: number;
  username: string;
  fullName: string;
  phone?: string;
  email?: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface UserRequest {
  username: string;
  password?: string; // Bắt buộc khi tạo mới
  fullName: string;
  phone?: string;
  email?: string;
  roleId: number;
}
