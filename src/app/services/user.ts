import {baseApi, Response} from "./service";
import {User} from "./auth";

interface ListUserReq {
    page: number;
    page_size: number;
    nickname?: string
}

interface CreateUserReq {
    username: string;
    nickname: string;
    password: string;
    email: string;
    avatar: string;
}

interface UpdateUserReq {
    id: number;
    nickname: string;
    avatar: string;
}

const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllUsers: build.query<Response<User[]>, void>({
            query: () => ({
                url: "/users/all",
            }),
            providesTags: [{type: "User", id: "LIST"}],
        }),
        getUserList: build.query<Response<User[]>, ListUserReq>({
            query: (params) => ({
                url: "/users",
                params
            }),
            providesTags: [{type: "User", id: "LIST"}]
        }),
        createUser: build.mutation<Response<User>, CreateUserReq>({
            query: (data) => ({
                url: "/user",
                method: "POST",
                body: data
            }),
            invalidatesTags: [{type: "User", id: "LIST"}]
        }),
        updateUser: build.mutation<Response<User>, UpdateUserReq>({
            query: (data) => ({
                url: `/user/${data.id}`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: [{type: "User", id: "LIST"}]
        }),
        deleteUser: build.mutation<Response<void>, number>({
            query: (id) => ({
                url: `/user/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: [{type: "User", id: "LIST"}]
        })
    })
})

export const {
    useGetAllUsersQuery,
    useGetUserListQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation
} = userApi;