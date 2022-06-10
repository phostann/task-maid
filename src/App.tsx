import React, {useCallback, useEffect} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {Token} from "./app/services/auth";
import Auth from "./features/auth/Auth";
import {selectToken, setCredentials} from "./features/auth/authSlice";
import Login from "./features/auth/Login";
import {useAppDispatch, useTypedSelector} from "./hooks/store";
import BasicLayout from "./layouts/BasicLayout";
import {IRouteProps, routes} from "./routes/routes";

function App() {

    const dispatch = useAppDispatch();
    const token = useTypedSelector(selectToken);

    const renderRoutes = useCallback((routes: IRouteProps[]): React.ReactNode => routes.map((r, i) => <React.Fragment
        key={r.path}>
        <Route key={r.path} path={r.path} element={renderElement(r)}/>
        {r.routes && renderRoutes(r.routes)}
    </React.Fragment>), []);

    const renderElement = useCallback((r: IRouteProps) => {
        if (r.redirect) {
            return <Navigate to={r.redirect}/>
        } else if (r.element) {
            const Element = r.element;
            return <React.Suspense fallback={<>...</>}>
                <Auth>
                    <Element/>
                </Auth>
            </React.Suspense>
        } else {
            return null;
        }
    }, [])

    // load jwt from local storage
    useEffect(() => {
        if (token == null) {
            try {
                const tokenCache = localStorage.getItem("token");
                if (tokenCache != null) {
                    const token = JSON.parse(tokenCache) as Token;
                    dispatch(setCredentials(token));
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    return <>
        <Routes>
            <Route path={"/login"} element={<Login/>}/>
            <Route element={<BasicLayout/>}>
                {renderRoutes(routes)}
            </Route>
        </Routes>
    </>
}

export default App
