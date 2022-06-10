import {message} from 'antd';
import {BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from "@reduxjs/toolkit/query/react";
import {BASE_URL} from "../../../config/config";
import {RootState} from "../store";
import {Mutex} from "async-mutex";
import {Token} from "./auth";
import {setCredentials} from "../../features/auth/authSlice";


export type Response<T> = {
    data: T;
    msg: string;
    page?: number;
    page_size?: number;
    total?: number;
}

const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as RootState).auth.token;
        // if the request set Authorization header, don't override it
        if (!headers.has("Authorization") && token != null) {
            headers.set('Authorization', `Bearer ${token.access_token}`);
        }
        return headers;
    },
});

const baseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock()
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire()
            try {
                const state = api.getState() as RootState;
                const token = state.auth.token;
                const headers: Record<string, string> = {}
                if (token != null) {
                    headers['authorization'] = `Bearer ${token.refresh_token}`
                }
                const refreshRes = await baseQuery({
                    url: "/auth/refresh",
                    method: "POST",
                    headers,
                }, api, extraOptions)
                if (refreshRes.data) {
                    const res = refreshRes.data as Response<Token>
                    api.dispatch(setCredentials(res.data))
                    localStorage.setItem("token", JSON.stringify(res.data))
                    result = await baseQuery(args, api, extraOptions);
                } else if (refreshRes.error) {
                    message.error("登录过期，请重新登录")
                    window.location.replace("/login")
                }
            } catch (e) {
                console.log(e)
            } finally {
                release()
            }
        } else {
            await mutex.waitForUnlock()
            result = await baseQuery(args, api, extraOptions)
        }
    }
    return result;
}


export const baseApi = createApi({
    reducerPath: 'baseApi',
    tagTypes: ["Auth", "User", "Task"],
    baseQuery: baseQueryWithReAuth,
    endpoints: () => ({}),
});
