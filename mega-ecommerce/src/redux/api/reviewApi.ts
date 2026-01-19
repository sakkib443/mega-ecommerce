import { baseApi } from "./baseApi";

export const reviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllReviews: builder.query({
            query: (params) => ({
                url: '/reviews/admin/all',
                method: 'GET',
                params
            }),
            providesTags: ['Reviews']
        }),
        getReviewStats: builder.query({
            query: () => ({
                url: '/reviews/admin/stats',
                method: 'GET'
            }),
            providesTags: ['Reviews']
        }),
        updateReviewStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/reviews/admin/${id}/status`,
                method: 'PATCH',
                body: { status }
            }),
            invalidatesTags: ['Reviews']
        }),
        addAdminReply: builder.mutation({
            query: ({ id, reply }) => ({
                url: `/reviews/admin/${id}/reply`,
                method: 'POST',
                body: { reply }
            }),
            invalidatesTags: ['Reviews']
        }),
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/reviews/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Reviews']
        }),
        // For product page
        getProductReviews: builder.query({
            query: ({ productId, ...params }) => ({
                url: `/reviews/product/${productId}`,
                method: 'GET',
                params
            }),
            providesTags: (result, error, { productId }) => [{ type: 'Reviews', id: productId }]
        }),
    })
});

export const {
    useGetAllReviewsQuery,
    useGetReviewStatsQuery,
    useUpdateReviewStatusMutation,
    useAddAdminReplyMutation,
    useDeleteReviewMutation,
    useGetProductReviewsQuery
} = reviewApi;
