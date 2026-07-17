export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED' | 'PARTIALLY_RETURNED';

export interface OrderItem {
  id?: number;
  variantId: number;
  quantity: number;
  productName?: string;
  productSku?: string;
  unitPrice?: number;
  subtotal?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  code?: string; // Alias for safety
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  status: OrderStatus;
  paymentMethod?: 'CASH' | 'QR_SEPAY';
  customerId: number;
  customerName?: string;
  pointsUsed?: number;
  pointsEarned?: number;
  discountFromPoints?: number;
  voucherCode?: string;
  discountFromVoucher?: number;
  createdById: number;
  createdByUsername?: string;
  note?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderRequest {
  customerId: number;
  paidAmount?: number;
  paymentMethod?: 'CASH' | 'QR_SEPAY';
  note?: string;
  pointsToUse?: number;
  voucherCode?: string;
  status?: OrderStatus;
  items: {
    variantId: number;
    quantity: number;
  }[];
}

export interface ReturnOrderItem {
  id: number;
  variantId: number;
  productName: string;
  productSku: string;
  quantity: number;
  refundPrice: number;
  subtotal: number;
}

export interface ReturnOrder {
  id: number;
  returnNumber: string;
  originalOrderId: number;
  originalOrderNumber: string;
  customerId: number;
  customerName: string;
  createdById: number;
  createdByUsername: string;
  approvedByUsername?: string;
  totalRefundAmount: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
  items: ReturnOrderItem[];
}

export interface ReturnOrderRequest {
  originalOrderId: number;
  reason: string;
  approvalPin?: string;
  items: {
    variantId: number;
    quantity: number;
  }[];
}

