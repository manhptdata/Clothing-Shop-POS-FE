export interface Warehouse {
  id: number;
  name: string;
  address?: string;
  isActive: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  address?: string;
  isActive: boolean;
}

export type ReceiptStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// (Thêm các type chi tiết cho StockReceipt, ReturnTicket nếu cần)
