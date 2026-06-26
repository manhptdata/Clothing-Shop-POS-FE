import { baseApi } from "./baseApi";
import type { Supplier, SupplierRequest, SupplierQueryParams } from "@/types/supplier.types";
import type { PageResponse, RestResponse } from '@/types/common.types';

export const supplierApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET all suppliers
        getSuppliers: builder.query<PageResponse<Supplier>, SupplierQueryParams>({
            query: (params) => ({
                url: "suppliers",
                method: "GET",
                params,
            }),
            transformResponse: (response: RestResponse<PageResponse<Supplier>>) => response.data,
            providesTags: (result) => {
                if (result?.content) {
                    return [
                        ...result.content.map(({ id }) => ({
                            type: "Supplier" as const,
                            id: id,
                        })),
                        { type: "Supplier", id: "LIST" },
                    ];
                }
                return [{ type: "Supplier", id: "LIST" }];
            },
        }),

        // GET supplier by id
        getSupplierById: builder.query<Supplier, number>({
            query: (id) => ({
                url: `suppliers/${id}`,
                method: "GET",
            }),
            transformResponse: (response: RestResponse<Supplier>) => response.data,
            providesTags: (result, error, id) => [{ type: "Supplier", id }],
        }),

        // CREATE supplier
        createSupplier: builder.mutation<Supplier, SupplierRequest>({
            query: (supplierData) => ({
                url: "suppliers",
                method: "POST",
                data: supplierData,
            }),
            transformResponse: (response: RestResponse<Supplier>) => response.data,
            invalidatesTags: [{ type: "Supplier", id: "LIST" }],
        }),

        // UPDATE supplier
        updateSupplier: builder.mutation<
            Supplier,
            { id: number; data: SupplierRequest }
        >({
            query: ({ id, data }) => ({
                url: `suppliers/${id}`,
                method: "PUT",
                data: data,
            }),
            transformResponse: (response: RestResponse<Supplier>) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Supplier", id: id },
                { type: "Supplier", id: "LIST" },
            ],
        }),

        // DELETE (soft) supplier
        softDeleteSupplier: builder.mutation<Supplier, number>({
            query: (id) => ({
                url: `suppliers/${id}`,
                method: "DELETE",
            }),
            transformResponse: (response: RestResponse<Supplier>) => response.data,
            invalidatesTags: (result, error, id) => [
                { type: "Supplier", id },
                { type: "Supplier", id: "LIST" },
            ],
        }),

        // DELETE (hard) supplier
        hardDeleteSupplier: builder.mutation<void, number>({
            query: (id) => ({
                url: `suppliers/${id}/permanent`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Supplier", id: "LIST" }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetSuppliersQuery,
    useGetSupplierByIdQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useSoftDeleteSupplierMutation,
    useHardDeleteSupplierMutation,
} = supplierApi;
