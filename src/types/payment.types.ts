export interface PaymentLog {
  id: number;
  referenceCode: string;
  orderNumber?: string;
  transferAmount?: number;
  gateway?: string;
  transactionDate?: string;
  content?: string;
  status: 'SUCCESS' | 'INSUFFICIENT' | 'NO_ORDER' | 'ERROR' | 'PROCESSING';
  createdAt: string;
}
