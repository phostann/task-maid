import React, {FC, useEffect, useState} from "react";
import {Avatar, Dropdown, Menu} from "antd";
import {IRouteProps, routes} from "../routes/routes";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined} from "@ant-design/icons";
import {ItemType} from "antd/es/menu/hooks/useItems";
import {useProfileQuery} from "../app/services/auth";
import {useAppDispatch} from "../hooks/store";
import {setCredentials} from "../features/auth/authSlice";

const BasicLayout: FC = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const {data, isSuccess} = useProfileQuery();
    const [collapsed, setCollapsed] = useState(false);
    const [key, setKey] = useState<string>();

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const getMenuItems = (routes: IRouteProps[]): ItemType[] => {
        return routes.filter(r => !r.hideInMenu).map(r => {
            const Icon = r.icon ?? React.Fragment;
            if (r.routes) {
                return {
                    label: r.name,
                    key: r.path,
                    icon: <Icon/>,
                    children: getMenuItems(r.routes),
                }
            }
            return {
                label: r.name,
                key: r.path,
                icon: <Icon/>,
            }
        });
    };

    const onNavigate = ({key}: any) => {
        navigate(key);
    };

    const onUserMenuSelected = ({key}: any) => {
        switch (key) {
            case "1":
                localStorage.removeItem("token");
                dispatch(setCredentials(null));
                navigate("/login");
                break;
        }
    };

    useEffect(() => {
        setKey(location.pathname);
    }, [location.pathname]);

    const userMenu = (
        <Menu onClick={onUserMenuSelected}
              items={[
                  // {
                  //     icon: <UserOutlined/>,
                  //     label: '个人中心',
                  //     key: "0",
                  // },
                  // {
                  //     type: "divider",
                  // },
                  {
                      icon: <LogoutOutlined/>,
                      label: "退出登录",
                      key: "1"
                  }
              ]}/>
    );

    return <div className={"w-screen h-screen flex flex-col overflow-hidden"}>
        <header className={"w-full overflow-x-hidden flex items-center px-4 h-12 box-border bg-[#001529]"}>
            <Link to={"/home"}>
                <img src="/images/logo.svg" alt="#" className={"w-7 h-7"}/>
            </Link>
            <h1 className={"text-white mx-3 my-0 text-xl"}>React Admin</h1>
            <Dropdown overlay={userMenu}>
                <div
                    className={"!ml-auto h-full flex items-center hover:bg-[#252a3d] transition-all duration-300 px-3 cursor-pointer"}>
                    <Avatar size={"small"}
                            src={isSuccess ? data.data.avatar?.length ? data.data.avatar : "/images/avatar.jpeg" : "/images/avatar.jpeg"}/>
                    <span className={"ml-2 text-white"}>{isSuccess ? data.data.nickname : ""}</span>
                </div>
            </Dropdown>
        </header>
        <div className={"flex-1 flex flex-nowrap overflow-hidden"}>
            <div
                className={`h-full relative ${collapsed ? "w-[48px]" : "w-48"} flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] shadow-[2px_0_8px_0_rgba(29,35,41,0.05)]`}>
                <Menu items={getMenuItems(routes)}
                      selectedKeys={key ? [key] : []}
                      inlineCollapsed={collapsed}
                      mode={"inline"}
                      className={`${collapsed ? "!w-[48px]" : ""} flex-1`}
                      onSelect={onNavigate}/>
                <Menu selectable={false}
                      items={[{label: collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>, key: "0"}]}
                      onClick={toggleCollapsed}>
                </Menu>
            </div>
            <section className={"flex-1 h-full bg-[#f0f2f5] p-6 box-border"}>
                <Outlet/>
            </section>
        </div>
    </div>
}

export default BasicLayout;