import { baseApi } from "./baseApi";
import type { Category } from "@/types/category.type";
import type { RestResponse } from '@/types/common.types';

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET all categories
        getCategories: builder.query<Category[], void>({
            query: () => ({
                url: "categories",
                method: "GET",
            }),
            transformResponse: (response: RestResponse<Category[]>) => {
                return response.data || [];
            },
            providesTags: (result) => {
                if (result && Array.isArray(result)) {
                    return [
                        ...result.map(({ id }) => ({
                            type: "Category" as const,
                            id: id,
                        })),
                        { type: "Category", id: "LIST" },
                    ];
                }
                return [{ type: "Category", id: "LIST" }];
            },
        }),

        // CREATE category
        createCategory: builder.mutation<Category, { name: string }>({
            query: (categoryData) => ({
                url: "categories",
                method: "POST",
                data: categoryData, // Gửi { name: "..." }
            }),
            transformResponse: (response: RestResponse<Category>) => response.data,
            invalidatesTags: [{ type: "Category", id: "LIST" }],
        }),

        // UPDATE category
        updateCategory: builder.mutation<
            Category,
            { id: number; name: string } // Đổi categoryId thành id
        >({
            query: ({ id, ...categoryData }) => ({
                url: `categories/${id}`,
                method: "PUT",
                data: categoryData,
            }),
            transformResponse: (response: RestResponse<Category>) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Category", id: id },
                { type: "Category", id: "LIST" },
            ],
        }),

        // DELETE s category
        deleteCategory: builder.mutation<void, number>({
            query: (id) => ({
                url: `categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Category", id: "LIST" }],
        }),
        // DELETE hard category
        deleteHardCategory: builder.mutation<void, number>({
            query: (id) => ({
                url: `categories/${id}/permanent`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Category", id: "LIST" }],
        }),

        // TOGGLE active category
        toggleCategoryActive: builder.mutation<Category, { id: number; active: boolean }>({
            query: ({ id, active }) => ({
                url: `categories/${id}/active`,
                method: "PATCH",
                params: { active },
            }),
            transformResponse: (response: RestResponse<Category>) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Category", id: id },
                { type: "Category", id: "LIST" },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useDeleteHardCategoryMutation,
    useToggleCategoryActiveMutation,
} = categoryApi;