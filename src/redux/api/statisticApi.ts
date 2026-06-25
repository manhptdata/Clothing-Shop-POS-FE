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
  }),
  overrideExisting: false,
});

export const { useGetDailyStatisticsQuery, useGetWeeklyStatisticsQuery } = statisticApi;
