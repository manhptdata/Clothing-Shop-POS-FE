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
  rewardPoints?: number;
  vouchers?: VoucherInfo[];
}

export interface VoucherInfo {
  id: number;
  voucherCode: string;
  voucherName: string;
  discountAmount: number;
  minOrderValue: number;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  expiredAt: string;
}

export interface CustomerRequest {
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender: GenderEnum;
  address?: string;
  note?: string;
  customerGroupId?: number;
}


export type CustomerVoucher = VoucherInfo;

export interface CustomerUpdateRequest extends CustomerRequest {
  status: 'ACTIVE' | 'INACTIVE';
}


export interface OrderItem {
  id: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerOrderHistory {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: string;
  printed: boolean;
  items: OrderItem[];
  createdByUsername: string;
  createdById: number;
  note?: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
}


export interface CustomerCareLog {
  id: number;
  calledBy?: { fullName: string };
  calledAt?: string;
  campaign?: { name: string };
  result: string;
  order?: any;
  note?: string;
  createdAt: string;
}
