import {baseApi, Response} from "./service";
import {setCredentials} from "../../features/auth/authSlice";

export interface User {
    id: number;
    username: string;
    nickname: string;
    email: string;
    avatar: string;
    gender: string;
    created_at: string;
    updated_at: string;
}

export interface Token {
    access_token: string;
    refresh_token: string;
}

export interface LoginReq {
    username: string;
    password: string;
}

export const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        profile: build.query<Response<User>, void>({
            query: () => ({
                url: "/auth/profile",
            }),
            providesTags: [{type: "Auth", id: "PROFILE"}],
        }),
        login: build.mutation<Response<Token>, LoginReq>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                try {
                    const res = await queryFulfilled;
                    dispatch(setCredentials(res.data.data));
                    localStorage.setItem("token", JSON.stringify(res.data.data));
                } catch (e) {
                    console.error(e);
                }
            },
            invalidatesTags: [{type: "Auth", id: "PROFILE"}],
        }),
        refresh: build.mutation({
            query: () => {
                let refreshToken = "";
                try {
                    const tokenCache = localStorage.getItem('token');
                    if (tokenCache != null) {
                        const token = JSON.parse(tokenCache) as Token;
                        refreshToken = token.refresh_token;
                    }
                } catch (e) {
                    console.error(e)
                }
                return {
                    url: "/auth/refresh",
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${refreshToken}`,
                    }
                }
            }
        })
    }),
});

export const {useLoginMutation, useProfileQuery} = userApi;
