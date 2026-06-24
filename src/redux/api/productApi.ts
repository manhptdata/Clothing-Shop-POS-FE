import { baseApi } from './baseApi';
import type { Product, ProductRequest, ProductUpdateRequest, ProductFilterParams } from '@/types/product.types';
import type { RestResponse, PageResponse } from '@/types/common.types';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<RestResponse<PageResponse<Product>>, ProductFilterParams | void>({
      query: (params) => ({
        url: '/products',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data?.content
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query<RestResponse<Product>, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<RestResponse<Product>, ProductRequest>({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<RestResponse<Product>, { id: number; data: ProductUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
    deleteProduct: builder.mutation<RestResponse<Product>, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
    hardDeleteProduct: builder.mutation<RestResponse<string>, number>({
      query: (id) => ({
        url: `/products/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useHardDeleteProductMutation,
} = productApi;
