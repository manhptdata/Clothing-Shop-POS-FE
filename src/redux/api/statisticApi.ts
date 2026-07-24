import { baseApi } from './baseApi';
import type { RestResponse } from '@/types/common.types';
import type { DailyStatisticResponse, DailyStatisticItemResponse } from '@/types/statistic.types';

export const statisticApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDailyStatistics: builder.query<RestResponse<DailyStatisticResponse>, void>({
      query: () => ({
        url: '/statistics/daily',
        method: 'GET',
      }),
      providesTags: [{ type: 'Statistic', id: 'LIST' }],
    }),
    getWeeklyStatistics: builder.query<RestResponse<DailyStatisticItemResponse[]>, void>({
      query: () => ({
        url: '/statistics/weekly',
        method: 'GET',
      }),
      providesTags: [{ type: 'Statistic', id: 'LIST' }],
    }),
    getPeriodStatistics: builder.query<
      RestResponse<DailyStatisticResponse>,
      { period: string; startDate?: string; endDate?: string } | string
    >({
      query: (arg) => {
        const params = typeof arg === 'string' ? { period: arg } : { period: arg.period, startDate: arg.startDate, endDate: arg.endDate };
        return {
          url: '/statistics/summary',
          method: 'GET',
          params,
        };
      },
      providesTags: [{ type: 'Statistic', id: 'LIST' }],
    }),
    getChartStatistics: builder.query<
      RestResponse<DailyStatisticItemResponse[]>,
      { period: string; startDate?: string; endDate?: string } | string
    >({
      query: (arg) => {
        const params = typeof arg === 'string' ? { period: arg } : { period: arg.period, startDate: arg.startDate, endDate: arg.endDate };
        return {
          url: '/statistics/chart',
          method: 'GET',
          params,
        };
      },
      providesTags: [{ type: 'Statistic', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDailyStatisticsQuery,
  useGetWeeklyStatisticsQuery,
  useGetPeriodStatisticsQuery,
  useGetChartStatisticsQuery,
} = statisticApi;
