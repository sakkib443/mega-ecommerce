import { baseApi } from './baseApi';

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: (params) => ({
                url: '/categories',
                params,
            }),
            providesTags: ['Categories'],
        }),
        getCategoryTree: builder.query({
            query: () => '/categories/tree',
            providesTags: ['Categories'],
        }),
        getCategoryById: builder.query({
            query: (id) => `/categories/${id}`,
            providesTags: (result, error, id) => [{ type: 'Categories', id }],
        }),
        createCategory: builder.mutation({
            query: (data) => ({
                url: '/categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Categories'],
        }),
        updateCategory: builder.mutation({
            query: ({ id, data }) => ({
                url: `/categories/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['Categories', { type: 'Categories', id }],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Categories'],
        }),
        updateCategoryOrder: builder.mutation({
            query: (data) => ({
                url: '/categories/admin/order',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Categories'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryTreeQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useUpdateCategoryOrderMutation,
} = categoryApi;
