export interface DailyStatisticResponse {
  dailyRevenue: number;
  newCustomers: number;
  newOrders: number;
}

export interface DailyStatisticItemResponse {
  date: string;
  revenue: number;
  orderCount: number;
}

