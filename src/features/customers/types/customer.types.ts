export type GenderEnum = 'MALE' | 'FEMALE' | 'OTHER';

export interface CustomerGroup {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender: GenderEnum;
  address?: string;
  note?: string;
  groupId: number;
  groupName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender: GenderEnum;
  address?: string;
  note?: string;
  groupId: number;
}
