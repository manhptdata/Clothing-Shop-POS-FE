export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  code: string;
  totalAmount: number;
  customerPaid: number;
  changeAmount: number;
  status: OrderStatus;
  customerId: number;
  customerName?: string;
  warehouseId: number;
  warehouseName?: string;
  createdById: number;
  note?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderRequest {
  customerId: number;
  warehouseId: number;
  totalAmount: number;
  customerPaid: number;
  changeAmount: number;
  note?: string;
  items: OrderItem[];
}
