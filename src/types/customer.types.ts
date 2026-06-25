export type GenderEnum = 'MALE' | 'FEMALE' | 'OTHER';

export interface CustomerGroup {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface CustomerRequest {
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender: GenderEnum;
  address?: string;
  note?: string;
  groupId?: number;
}


// Định nghĩa một voucher của khách
export interface CustomerVoucher {
  id: number;
  voucherCode: string;
  voucherName: string;
  discountAmount: number;
  minOrderValue: number;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  expiredAt: string;
}

// Định nghĩa ông Khách Hàng
export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  note: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  rewardPoints: number;
  customerGroup: {
    id: number;
    name: string;
    code: string;
  };
  vouchers: CustomerVoucher[];
}

// Định nghĩa tham số tìm kiếm gửi lên Backend
export interface CustomerFilterParams {
  keyword?: string;
  page?: number;
  size?: number;
}


// Bộ tham số dùng cho chức năng Lọc/Tìm kiếm
export interface CustomerFilterParams {
  keyword?: string;
  page?: number;
  size?: number;
}

// sữa thông tin khách hàng
export interface CustomerUpdateRequest {
  fullName: string;
  phone: string;
  dateOfBirth?: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string | null;
  note?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

// Định nghĩa cấu trúc Item trong đơn hàng của khách
export interface CustomerOrderItem {
  id: number;
  variantId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Định nghĩa cấu trúc Đơn hàng trả về trong lịch sử mua hàng
export interface CustomerOrderHistory {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  createdById: number;
  createdByUsername: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  status: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  printed: boolean;
  items: CustomerOrderItem[];
}

export interface CareLogResponse {
  id: number;
  result: string;
  note: string;
  scheduledAt: string | null;
  calledAt: string | null;
  nextRetryAt: string | null;
  createdAt: string;
  customer: {
    id: number;
    fullName: string;
    phone: string;
  } | null;
  campaign: {
    id: number;
    name: string;
  } | null;
  calledBy: {
    id: number;
    username: string;
    fullName: string;
  } | null;
  order: any | null;
}
