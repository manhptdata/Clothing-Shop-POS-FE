export interface DailyStatisticResponse {
  dailyRevenue: number;
  dailyCogs?: number;
  dailyProfit?: number;
  newCustomers: number;
  newOrders: number;
}

export interface DailyStatisticItemResponse {
  date: string;
  revenue: number;
  cogs?: number;
  profit?: number;
  orderCount: number;
}

