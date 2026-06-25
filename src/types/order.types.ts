export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

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
  paidAmount: number;
  note?: string;
  pointsToUse?: number;
  voucherCode?: string;
  items: {
    variantId: number;
    quantity: number;
  }[];
}
