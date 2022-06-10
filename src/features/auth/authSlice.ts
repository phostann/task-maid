import {Token} from "../../app/services/auth";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";

export interface AuthState {
    token: Token | null;
}

const getInitialState = (): AuthState => {
    const initialState: AuthState = {
        token: null,
    };
    // try to load token from local storage
    try {
        const tokenCache = localStorage.getItem('token');
        if (tokenCache != null) {
            initialState.token = JSON.parse(tokenCache) as Token;
        }
    } catch (e) {
        console.error(e);
    }
    return initialState;
};

const userSlice = createSlice({
    name: "auth",
    initialState: getInitialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<Token | null>) => {
            state.token = action.payload;
        },
    }
});

export const {setCredentials} = userSlice.actions;

export default userSlice.reducer;

export const selectToken = (state: RootState) => state.auth.token;