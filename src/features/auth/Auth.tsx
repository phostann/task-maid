import React, {FC, useEffect} from "react";
import {useTypedSelector} from "../../hooks/store";
import {selectToken} from "./authSlice";
import {useNavigate} from "react-router-dom";
import {NEED_AUTH} from "../../../config/config";

interface AuthProps {
    children?: React.ReactNode;
}

const Auth: FC<AuthProps> = ({children}) => {

    const navigate = useNavigate();
    const token = useTypedSelector(selectToken);

    useEffect(() => {
        if (!NEED_AUTH) {
            return;
        }
        if (token == null) {
            navigate("/login");
        }
    }, [token]);

    return <>
        {children}
    </>;
}

export default Auth;
