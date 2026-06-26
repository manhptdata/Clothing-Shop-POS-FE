import { baseApi } from "./baseApi";
import type { StockReceipt, StockReceiptRequest } from "@/types/receipt.types";
import type { PageResponse, RestResponse } from "@/types/common.types";

export interface ReceiptQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    status?: string;
    search?: string;
}

export const receiptApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET all receipts (pageable)
        getReceipts: builder.query<PageResponse<StockReceipt>, ReceiptQueryParams | void>({
            query: (params) => ({
                url: "receipts",
                method: "GET",
                params: params || undefined,
            }),
            transformResponse: (response: RestResponse<PageResponse<StockReceipt>>) => response.data,
            providesTags: (result) => {
                if (result?.content) {
                    return [
                        ...result.content.map(({ id }) => ({ type: "Receipt" as const, id })),
                        { type: "Receipt", id: "LIST" },
                    ];
                }
                return [{ type: "Receipt", id: "LIST" }];
            },
        }),

        // GET receipt by id
        getReceiptById: builder.query<StockReceipt, number>({
            query: (id) => ({
                url: `receipts/${id}`,
                method: "GET",
            }),
            transformResponse: (response: RestResponse<StockReceipt>) => response.data,
            providesTags: (result, error, id) => [{ type: "Receipt", id }],
        }),

        // CREATE receipt (DRAFT)
        createReceipt: builder.mutation<StockReceipt, StockReceiptRequest>({
            query: (data) => ({
                url: "receipts",
                method: "POST",
                data,
            }),
            transformResponse: (response: RestResponse<StockReceipt>) => response.data,
            invalidatesTags: [{ type: "Receipt", id: "LIST" }],
        }),

        // UPDATE receipt (DRAFT)
        updateReceipt: builder.mutation<StockReceipt, { id: number; data: StockReceiptRequest }>({
            query: ({ id, data }) => ({
                url: `receipts/${id}`,
                method: "PUT",
                data,
            }),
            transformResponse: (response: RestResponse<StockReceipt>) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Receipt", id },
                { type: "Receipt", id: "LIST" }
            ],
        }),

        // CONFIRM receipt → cộng tồn kho
        confirmReceipt: builder.mutation<StockReceipt, number>({
            query: (id) => ({
                url: `receipts/${id}/confirm`,
                method: "POST",
            }),
            transformResponse: (response: RestResponse<StockReceipt>) => response.data,
            // Sau confirm: invalidate phiếu này + list + product (tồn kho thay đổi)
            invalidatesTags: (result, error, id) => [
                { type: "Receipt", id },
                { type: "Receipt", id: "LIST" },
                { type: "Product", id: "LIST" },
            ],
        }),

        // CANCEL receipt → trừ tồn kho & rollback giá vốn
        cancelReceipt: builder.mutation<StockReceipt, number>({
            query: (id) => ({
                url: `receipts/${id}/cancel`,
                method: "POST",
            }),
            transformResponse: (response: RestResponse<StockReceipt>) => response.data,
            invalidatesTags: (result, error, id) => [
                { type: "Receipt", id },
                { type: "Receipt", id: "LIST" },
                { type: "Product", id: "LIST" },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetReceiptsQuery,
    useGetReceiptByIdQuery,
    useCreateReceiptMutation,
    useUpdateReceiptMutation,
    useConfirmReceiptMutation,
    useCancelReceiptMutation,
} = receiptApi;
