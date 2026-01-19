import { baseApi } from "./baseApi";

export const couponApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCoupons: builder.query({
            query: () => ({
                url: '/coupons',
                method: 'GET'
            }),
            providesTags: ['Coupons']
        }),
        getCouponById: builder.query({
            query: (id) => ({
                url: `/coupons/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Coupons', id }]
        }),
        createCoupon: builder.mutation({
            query: (data) => ({
                url: '/coupons',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Coupons']
        }),
        updateCoupon: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/coupons/${id}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => ['Coupons', { type: 'Coupons', id }]
        }),
        deleteCoupon: builder.mutation({
            query: (id) => ({
                url: `/coupons/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Coupons']
        }),
        applyCoupon: builder.mutation({
            query: (data) => ({
                url: '/coupons/apply',
                method: 'POST',
                body: data
            })
        }),
    })
});

export const {
    useGetCouponsQuery,
    useGetCouponByIdQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useDeleteCouponMutation,
    useApplyCouponMutation
} = couponApi;
