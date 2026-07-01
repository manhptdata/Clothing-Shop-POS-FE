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
  customerGroup?: CustomerGroup;
}

export interface CustomerWithEmail extends Customer {
  email?: string;
}

export interface VoucherInfo {
  id: number;
  voucherCode: string;
  voucherName: string;
  discountAmount: number;
  minOrderValue: number;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  expiredAt: string;
  receivedAt: string;
  usedAt: string | null;
  usedOrderId?: number;
  usedOrderCode?: string;
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

export interface CustomerRequestWithEmail extends CustomerRequest {
  email?: string;
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
  result: string;
  potentialStatus?: string;
  note: string | null;
  scheduledAt: string | null;
  calledAt: string | null;
  nextRetryAt: string | null;
  createdAt: string;
  customer: {
    id: number;
    fullName: string;
    phone: string;
  };
  campaign: {
    id: number;
    name: string;
    type?: string;
  } | null;
  calledBy: {
    id: number;
    username: string;
    fullName: string;
  };
  order: {
    id: number;
    orderNumber: string;
  } | null;
}



export interface CustomerGroups extends CustomerGroup {
  status: 'ACTIVE' | 'INACTIVE';
  totalCustomers: number;
  note?: string;
  minSpending: number;
  maxSpending: number | null;
  createdAt: string;
  birthdayVoucherId?: number | null;
  birthdayVoucherName?: string | null;
}

export interface VoucherOption {
  id: number;
  name: string;
  code: string;
  discountAmount?: number;
  minOrderValue?: number;
  status: 'ACTIVE' | 'INACTIVE';
}



// Bổ sung thêm các type cho Campaign
export type CampaignType = "AFTER_7_DAYS" | "LONG_TIME_NO_BUY" | "RECALL_SCHEDULE" | "HAPPY_BIRTHDAY";

export interface Campaign {
  id: number;
  isActive: boolean;
  createdAt: string;
  name: string;
  scriptTemplate: string;
  type: CampaignType;
}

// Tham số để gọi API danh sách khách hàng chờ chăm sóc
export interface PendingCustomerRequest {
  type: CampaignType;
  page?: number;
  size?: number;
  keyword?: string; // Nếu cần tìm kiếm theo SĐT
}


export interface CreateCareLogRequest {
  customerId: number;
  result: string;
  campaignId?: number;
  note?: string;
  nextRetryAt?: string;
}

export interface UpdateCareLogRequest {
  customerId: number;
  result: string;
  campaignId?: number;
  note?: string;
  nextRetryAt?: string | null;
}


export interface AiSuggestionResponseDto {
  callScript: string;
  smsTemplate: string;
  objectionHandling: string;
}
