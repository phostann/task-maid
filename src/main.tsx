import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import {store} from "./app/store";
import {ConfigProvider} from "antd";
import zh from "antd/es/locale/zh_CN";
import './index.css'
import "antd/dist/antd.min.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <ConfigProvider locale={zh}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </ConfigProvider>
        </Provider>
    </React.StrictMode>
)
