export interface TopProductStatistic {
  productName: string;
  productSku: string;
  soldQuantity: number;
  totalRevenue: number;
}

export interface LowStockProduct {
  variantId: number;
  productName: string;
  sku: string;
  currentQuantity: number;
  lowStockThreshold: number;
}

export interface DailyStatisticResponse {
  dailyRevenue: number;
  dailyCogs?: number;
  dailyProfit?: number;
  newCustomers: number;
  newOrders: number;
  averageOrderValue?: number;
  topProducts?: TopProductStatistic[];
  lowStockProducts?: LowStockProduct[];
  paymentMethodBreakdown?: Record<string, number>;
}

export interface DailyStatisticItemResponse {
  date: string;
  revenue: number;
  cogs?: number;
  profit?: number;
  orderCount: number;
}

