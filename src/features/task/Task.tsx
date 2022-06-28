import React, {FC, useMemo} from "react";
import type {Task as ITask} from "../../app/services/task"
import {
    TaskStatus,
    useCreateTaskMutation,
    useDeleteTaskMutation,
    useListTasksQuery,
    useUpdateTaskMutation
} from "../../app/services/task";
import {ColumnProps} from "antd/es/table";
import {Button, DatePicker, Divider, Form, Input, message, Modal, Popconfirm, Select, Table, Tag} from "antd";
import {useGetAllUsersQuery} from "../../app/services/user";
import {PlusOutlined, SearchOutlined} from "@ant-design/icons";
import moment, {Moment} from "moment";


type QueryTaskForm = {
    user_id?: number
    task_name?: string
    started_at?: Moment
    ended_at?: Moment
    status?: TaskStatus
}

type TaskForm = {
    id: number
    user_id: number
    task_name: string
    started_at: Moment
    ended_at: Moment
    status: TaskStatus
}


const Task: FC = () => {

    const [queryForm] = Form.useForm<QueryTaskForm>()
    const [form] = Form.useForm<TaskForm>()

    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10)
    const [visible, setVisible] = React.useState(false)
    const [id, setId] = React.useState<number>()
    const [userId, setUserId] = React.useState<number>()
    const [taskName, setTaskName] = React.useState<string>()
    const [startedAt, setStartedAt] = React.useState<string>()
    const [endedAt, setEndedAt] = React.useState<string>()
    const [status, setStatus] = React.useState<TaskStatus>()

    const {data: users} = useGetAllUsersQuery()
    const {data, isLoading} = useListTasksQuery({
        page: page,
        page_size: pageSize,
        user_id: userId,
        task_name: taskName,
        started_at: startedAt,
        ended_at: endedAt,
        status: status
    });
    const [createTask] = useCreateTaskMutation()
    const [updateTask] = useUpdateTaskMutation()
    const [deleteTask] = useDeleteTaskMutation()

    const onPageChange = (page: number, pageSize: number) => {
        setPage(page)
        setPageSize(pageSize)
    }

    const onQuery = () => {
        const values = queryForm.getFieldsValue()
        setUserId(values.user_id)
        setTaskName(values.task_name)
        setStartedAt(values.started_at?.format())
        setEndedAt(values.ended_at?.format())
        setStatus(values.status)
    }

    const onCancel = () => {
        form.resetFields()
        setVisible(false)
        setId(undefined)
    }

    const onAddTask = () => {
        setVisible(true)
    }

    const onFinish = () => {
        form.validateFields().then(values => {
            if (id == null) {
                createTask({
                    ...values,
                    started_at: values.started_at?.format(),
                    ended_at: values.ended_at?.format(),
                    status: TaskStatus.NOT_STARTED
                })
                    .then(() => {
                        message.success("创建成功")
                        setVisible(false)
                        form.resetFields()
                    })
                    .catch(() => {
                        message.error("创建失败")
                    })
            } else {
                updateTask({
                    ...values,
                    id: id,
                    started_at: values.started_at?.format(),
                    ended_at: values.ended_at?.format(),
                })
                    .then(() => {
                        message.success("更新成功")
                        setVisible(false)
                        form.resetFields()
                        setId(undefined)
                    })
                    .catch(() => {
                        message.error("更新失败")
                    })
            }
        })
    }

    const onEdit = (record: ITask) => {
        form.resetFields()
        setVisible(true)
        setId(record.id)
        form.setFieldsValue({
            ...record,
            started_at: record.started_at ? moment(record.started_at) : undefined,
            ended_at: record.ended_at ? moment(record.ended_at) : undefined
        });
    }

    const onDelete = (id: number) => {
        deleteTask(id)
            .then(() => {
                message.success("删除成功")
            })
            .catch(() => {
                message.error("删除失败")
            })
    }

    const columns = useMemo(() => [
        {
            title: "任务名称",
            dataIndex: "task_name",
            ellipsis: true
        },
        {
            title: "所属人员",
            dataIndex: "user_id",
            render: value => {
                const user = users?.data?.find(user => user.id === value)
                return user ? user.nickname : ""
            }
        },
        {
            title: "当前状态",
            dataIndex: "status",
            render: value => {
                switch (value as TaskStatus) {
                    case TaskStatus.NOT_STARTED:
                        return <Tag color={"cyan"}>未开始</Tag>
                    case TaskStatus.IN_PROGRESS:
                        return <Tag color={"green"}>进行中</Tag>
                    case TaskStatus.ABANDONED:
                        return <Tag color={"#f50"}>已废弃</Tag>
                    case TaskStatus.DONE:
                        return <Tag color={"#87d068"}>已完成</Tag>
                    default:
                        return ""
                }
            }
        },
        {
            title: "开始时间",
            dataIndex: "started_at",
            render: value => moment(value).format("YYYY-MM-DD HH:mm:ss")
        },
        {
            title: "结束时间",
            dataIndex: "ended_at",
            render: value => moment(value).format("YYYY-MM-DD HH:mm:ss")
        },
        {
            title: "操作",
            render: (value, record) => {
                return <>
                    <Button type={"link"} onClick={() => onEdit(record)}>编辑</Button>
                    <Popconfirm title={"确定删除吗？"} onConfirm={() => onDelete(record.id)}>
                        <Button type={"link"}>删除</Button>
                    </Popconfirm>
                </>
            }
        }
    ] as ColumnProps<ITask>[], [users, onEdit, onDelete]);

    return <div className={"w-full h-full bg-white p-4 flex flex-col"}>
        <div className={"w-full flex justify-between mb-4 pl-3"}>
            <Form form={queryForm} layout={"inline"} onFinish={onQuery} onReset={onQuery}>
                <Form.Item label={"人员姓名"} name={"user_id"} className={"!mb-4"}>
                    <Select allowClear placeholder={"请选择用户"} className={"!w-40"}>
                        {
                            users?.data?.map(u => <Select.Option key={u.id} value={u.id}>{u.nickname}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
                <Form.Item label={"任务名称"} name={"task_name"} className={"!mb-4"}>
                    <Input placeholder={"请输入任务名称"} className={"!w-40"}/>
                </Form.Item>
                <Form.Item label={"任务状态"} name={"status"} className={"!mb-4"}>
                    <Select allowClear placeholder={"请选择任务状态"} className={"!w-40"}>
                        <Select.Option value={TaskStatus.NOT_STARTED}>未开始</Select.Option>
                        <Select.Option value={TaskStatus.IN_PROGRESS}>进行中</Select.Option>
                        <Select.Option value={TaskStatus.ABANDONED}>已废弃</Select.Option>
                        <Select.Option value={TaskStatus.DONE}>已完成</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label={"开始时间"} name={"started_at"} className={"!mb-4"}>
                    <DatePicker showTime placeholder={"任务开始时间"} className={"!w-40"}/>
                </Form.Item>
                <Form.Item label={"结束时间"} name={"ended_at"} className={"!mb-4"}>
                    <DatePicker showTime placeholder={"任务结束时间"} className={"!w-40"}/>
                </Form.Item>
                <Form.Item className={"!mb-4"}>
                    <Button type={"primary"} htmlType={"submit"} icon={<SearchOutlined/>}>查询</Button>
                    <Divider type={"vertical"}/>
                    <Button type={"primary"} htmlType={"reset"}>重置</Button>
                </Form.Item>
            </Form>
            <Button type={"primary"} icon={<PlusOutlined/>} onClick={onAddTask}>新增</Button>
        </div>
        <div className={"flex-1 overflow-hidden"}>
            <Table columns={columns}
                   scroll={{y: `calc(100vh - 350px)`}}
                   rowKey={"id"}
                   dataSource={data?.data ?? []}
                   loading={isLoading}
                   pagination={{
                       current: page,
                       pageSize: pageSize,
                       total: data?.total ?? 0,
                       showSizeChanger: true,
                       showTotal: (total) => `共 ${total} 条记录`,
                       onChange: onPageChange
                   }}/>
        </div>
        <Modal title={"新增任务"} visible={visible} onOk={onFinish} onCancel={onCancel}>
            <Form form={form} labelCol={{span: 4}}>
                <Form.Item label={"用户"} name={"user_id"} rules={[{required: true}]}>
                    <Select allowClear placeholder={"请选择用户"}>
                        {
                            users?.data?.map(u => <Select.Option key={u.id} value={u.id}>{u.nickname}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
                <Form.Item label={"任务名称"} name={"task_name"} rules={[{required: true}]}>
                    <Input placeholder={"请输入任务名称"}/>
                </Form.Item>
                {
                    id != null && <Form.Item label={"任务状态"} name={"status"} rules={[{required: true}]}>
                        <Select allowClear placeholder={"请选择任务状态"}>
                            <Select.Option value={TaskStatus.NOT_STARTED}>未开始</Select.Option>
                            <Select.Option value={TaskStatus.IN_PROGRESS}>进行中</Select.Option>
                            <Select.Option value={TaskStatus.ABANDONED}>已废弃</Select.Option>
                            <Select.Option value={TaskStatus.DONE}>已完成</Select.Option>
                        </Select>
                    </Form.Item>
                }
                <Form.Item label={"开始时间"} name={"started_at"} rules={[{required: true}]}>
                    <DatePicker showTime placeholder={"任务开始时间"}/>
                </Form.Item>
                <Form.Item label={"结束时间"} name={"ended_at"} rules={[{required: true}]}>
                    <DatePicker showTime placeholder={"任务结束时间"}/>
                </Form.Item>
            </Form>
        </Modal>
    </div>
}

export default Task;