import React, {FC, useMemo} from "react"
import {Button, Form, Popconfirm, Table, Input, Modal, message} from "antd"
import {ColumnProps} from "antd/lib/table"
import {User as IUser} from "../../app/services/auth"
import {
    useCreateUserMutation,
    useDeleteUserMutation,
    useGetUserListQuery,
    useUpdateUserMutation
} from "../../app/services/user"
import {SearchOutlined, PlusOutlined} from "@ant-design/icons"

const DEFAULT_AVATAR = "https://img0.baidu.com/it/u=1942253063,3807598283&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"

type QueryUserForm = {
    nickname: string
}

type UserFrom = {
    id?: number
    username: string
    password: string
    nickname: string
    avatar: string
    email: string
}

const User: FC = () => {

    const [queryForm] = Form.useForm<QueryUserForm>()
    const [form] = Form.useForm<UserFrom>()

    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(10)
    const [nickname, setNickname] = React.useState<string>()
    const [visible, setVisible] = React.useState(false)
    const [id, setId] = React.useState<number>()

    const {data, isLoading} = useGetUserListQuery({page: page, page_size: pageSize, nickname: nickname})
    const [createUser] = useCreateUserMutation()
    const [deleteUser] = useDeleteUserMutation()
    const [updateUser] = useUpdateUserMutation()

    const onPageChange = (page: number, pageSize: number) => {
        setPage(page)
        setPageSize(pageSize)
    }

    const onQuery = () => {
        const values = queryForm.getFieldsValue()
        setNickname(values.nickname)
    }

    const onAddUser = () => {
        setVisible(true)
    }

    const onEditUser = (record: IUser) => {
        form.setFieldsValue(record)
        setId(record.id)
        setVisible(true)
    }

    const onDeleteUser = (id: number) => {
        deleteUser(id)
            .then(() => {
                message.success("删除成功")
            })
            .catch(() => {
                message.error("删除失败")
            })

    }

    const onFinish = () => {
        form.validateFields().then(values => {
            if (id) {
                updateUser({...values, avatar: DEFAULT_AVATAR, id: id!})
                    .then(() => {
                        message.success("修改成功")
                        setVisible(false)
                        setId(undefined)
                    })
                    .catch(() => {
                        message.error("修改失败")
                    })
            } else {
                createUser({...values, avatar: DEFAULT_AVATAR})
                    .then(res => {
                        message.success("创建成功")
                        setVisible(false)
                        form.resetFields()
                    })
                    .catch(err => {
                        message.error(err.message)
                    })

            }
        })
    }

    const onCancel = () => {
        form.resetFields()
        setVisible(false)
    }

    const columns = useMemo(() => {
        return [
            {
                title: "姓名",
                dataIndex: "nickname",
            },
            {
                title: "头像",
                dataIndex: "avatar",
                render: (text) => <img className="block rounded-full w-10 h-10" src={text} alt="#"/>
            },
            {
                title: "角色",
                dataIndex: "role",
                render: (text: string) => {
                    if (text == "user") {
                        return "普通用户"
                    }
                    if (text == "admin") {
                        return "管理员"
                    }
                    return "未知"
                }
            },
            {
                title: "邮箱",
                dataIndex: "email"
            },
            {
                title: "操作",
                dataIndex: "action",
                render: (_, record) => <>
                    <Button type="link" onClick={() => onEditUser(record)}>编辑</Button>
                    <Popconfirm title="确定要删除？" onConfirm={() => onDeleteUser(record.id)}>
                        <Button type="link">删除</Button>
                    </Popconfirm>
                </>
            }
        ] as ColumnProps<IUser>[]
    }, [])

    return <div className={"w-full h-full flex flex-col bg-white p-4"}>
        <div className="w-full flex justify-between mb-4 pl-3">
            <Form form={queryForm} layout="inline" onFinish={onQuery}>
                <Form.Item label="人员姓名" name="nickname">
                    <Input allowClear/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" icon={<SearchOutlined></SearchOutlined>} htmlType="submit">查询</Button>
                </Form.Item>
            </Form>
            <Button type="primary" icon={<PlusOutlined></PlusOutlined>} onClick={onAddUser}>新增</Button>
        </div>
        <div className="flex-1 overflow-hidden">
            <Table dataSource={data?.data ?? []} columns={columns} loading={isLoading} rowKey="id"
                   scroll={{y: `calc(100%)`}} pagination={
                {
                    current: page,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    total: data?.total ?? 0,
                    showTotal: (total) => `共 ${total} 条记录`,
                    onChange: onPageChange
                }
            }></Table>
        </div>
        <Modal visible={visible} title={"新增用户"} onOk={onFinish} onCancel={onCancel}>
            <Form form={form} labelCol={{span: 4}}>
                <Form.Item name="id" hidden>
                    <Input/>
                </Form.Item>
                <Form.Item name={"email"} label="邮箱" rules={[{required: true, type: "email"}]}>
                    <Input type={"email"}></Input>
                </Form.Item>
                <Form.Item name={"username"} label="用户名" rules={[{required: true}]}>
                    <Input></Input>
                </Form.Item>
                {
                    !id && <Form.Item name={"password"} label="密码" rules={[{required: true, min: 8}]}>
                        <Input type={"password"}></Input>
                    </Form.Item>
                }
                <Form.Item name={"nickname"} label="昵称" rules={[{required: true}]}>
                    <Input></Input>
                </Form.Item>
            </Form>
        </Modal>
    </div>
}

export default User

