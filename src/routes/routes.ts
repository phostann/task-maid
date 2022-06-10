import React from "react";
import {BookOutlined, HomeOutlined, UsergroupAddOutlined,} from "@ant-design/icons";

export interface IRouteProps {
    path: string;
    name: string;
    hideInMenu?: boolean;
    icon?: React.ExoticComponent<any>;
    element?: React.LazyExoticComponent<any>;
    redirect?: string;
    routes?: IRouteProps[];
}

const Home = React.lazy(() => import("../features/home/Home"));
const Task = React.lazy(() => import("../features/task/Task"))
const User = React.lazy(() => import("../features/user/User"))


export const routes: IRouteProps[] = [
    {
        path: "/",
        name: "首页",
        hideInMenu: true,
        icon: HomeOutlined,
        redirect: "/home"
    },
    {
        path: "/home",
        name: "首页",
        hideInMenu: true,
        icon: HomeOutlined,
        element: Home
    },
    {
        path: "/task",
        name: "任务",
        icon: BookOutlined,
        element: Task
    },
    {
        path: "/user",
        name: "人员",
        icon: UsergroupAddOutlined,
        element: User
    }
]
