import type { RoleEnum } from '@/features/auth/types/auth.types';

export interface User {
  id: number;
  username: string;
  fullName: string;
  phone?: string;
  role: RoleEnum;
  isActive: boolean;
  createdAt: string;
}

export interface UserRequest {
  username: string;
  password?: string; // Bắt buộc khi tạo mới
  fullName: string;
  phone?: string;
  role: RoleEnum;
}
