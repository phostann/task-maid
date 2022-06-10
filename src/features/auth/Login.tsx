import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../app/services/auth";
import { useAppDispatch } from "../../hooks/store";
import { setCredentials } from "./authSlice";
import { Button, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

type LoginForm = {
    username: string;
    password: string;
}


const Login = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [login] = useLoginMutation();
    const [form] = Form.useForm<LoginForm>();

    const onLogin = useCallback(async (values: LoginForm) => {
        try {
            const tokenResponse = await login({ username: values.username, password: values.password }).unwrap();
            dispatch(setCredentials(tokenResponse.data));
            message.success("Login successful");
            navigate("/");
        } catch (e) {
            message.error("Login failed");
        }
    }, [dispatch, navigate, login]);

    return <div className={"w-screen h-screen flex items-center justify-center"}>
        <Form<LoginForm> form={form} className={"w-80"} onFinish={onLogin}>
            <Form.Item name={"username"} rules={[{ required: true, min: 6, max: 12 }]}>
                <Input prefix={<UserOutlined />} size={"large"} placeholder={"Username"} />
            </Form.Item>
            <Form.Item name={"password"} rules={[{ required: true, min: 6, max: 12 }]}>
                <Input prefix={<LockOutlined />} size={"large"} type={"password"} placeholder={"Password"} />
            </Form.Item>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"} className={"w-full"}>Submit</Button>
            </Form.Item>
        </Form>
    </div>;
};

export default Login;