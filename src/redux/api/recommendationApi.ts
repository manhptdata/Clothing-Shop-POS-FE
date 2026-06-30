import { baseApi } from './baseApi';
import type { RestResponse } from '@/types/common.types';

export interface RecommendationProduct {
  productId: number;
  productName: string;
  categoryName: string;
  imageUrls: string[];
  minPrice: number;
  totalStock: number;
  confidence: number | null;
}

export const recommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecommendations: builder.query<RestResponse<RecommendationProduct[]>, { productIds: number[]; limit?: number }>({
      query: ({ productIds, limit = 5 }) => ({
        url: '/recommendations',
        method: 'GET',
        params: {
          productIds: productIds.join(','),
          limit,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ productId }) => ({ type: 'Product' as const, id: productId })),
              { type: 'Product', id: 'RECOMMENDATIONS' },
            ]
          : [{ type: 'Product', id: 'RECOMMENDATIONS' }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetRecommendationsQuery } = recommendationApi;
