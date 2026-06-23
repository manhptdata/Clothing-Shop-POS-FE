export type InvoiceStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface InvoiceItem {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: number;
  code: string;
  totalAmount: number;
  customerPaid: number;
  changeAmount: number;
  status: InvoiceStatus;
  customerId: number;
  customerName?: string;
  warehouseId: number;
  warehouseName?: string;
  createdById: number;
  note?: string;
  createdAt: string;
  items: InvoiceItem[];
}

export interface InvoiceRequest {
  customerId: number;
  warehouseId: number;
  totalAmount: number;
  customerPaid: number;
  changeAmount: number;
  note?: string;
  items: InvoiceItem[];
}
