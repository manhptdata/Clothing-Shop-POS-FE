import { baseApi } from './baseApi';
import type { RestResponse } from '@/types/common.types';

export interface SystemSetting {
  settingKey: string;
  settingValue: string;
  description: string;
}

export const settingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<RestResponse<SystemSetting[]>, void>({
      query: () => ({ url: '/settings' }),
      providesTags: ['Setting'],
    }),
    updateSetting: builder.mutation<RestResponse<SystemSetting>, { key: string; value: string }>({
      query: ({ key, value }) => ({
        url: `/settings/${key}?value=${value}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Setting'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSettingsQuery, useUpdateSettingMutation } = settingApi;
