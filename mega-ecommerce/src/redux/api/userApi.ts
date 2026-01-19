import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminUsers: builder.query({
            query: (params) => ({
                url: '/users/admin/all',
                method: 'GET',
                params,
            }),
            providesTags: ['Users'],
        }),
        getAdminUserById: builder.query({
            query: (id) => ({
                url: `/users/admin/${id}`,
                method: 'GET',
            }),
            providesTags: ['Users'],
        }),
        getAdminUserStats: builder.query({
            query: () => ({
                url: '/users/admin/stats',
                method: 'GET',
            }),
            providesTags: ['Users'],
        }),
        updateUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/users/admin/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Users'],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/admin/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
    }),
});

export const {
    useGetAdminUsersQuery,
    useGetAdminUserByIdQuery,
    useGetAdminUserStatsQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = userApi;
