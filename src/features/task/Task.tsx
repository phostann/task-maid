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
                        message.success("????????????")
                        setVisible(false)
                        form.resetFields()
                    })
                    .catch(() => {
                        message.error("????????????")
                    })
            } else {
                updateTask({
                    ...values,
                    id: id,
                    started_at: values.started_at?.format(),
                    ended_at: values.ended_at?.format(),
                })
                    .then(() => {
                        message.success("????????????")
                        setVisible(false)
                        form.resetFields()
                        setId(undefined)
                    })
                    .catch(() => {
                        message.error("????????????")
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
                message.success("????????????")
            })
            .catch(() => {
                message.error("????????????")
            })
    }

    const columns = useMemo(() => [
        {
            title: "????????????",
            dataIndex: "task_name",
            ellipsis: true
        },
        {
            title: "????????????",
            dataIndex: "user_id",
            render: value => {
                const user = users?.data?.find(user => user.id === value)
                return user ? user.nickname : ""
            }
        },
        {
            title: "????????????",
            dataIndex: "status",
            render: value => {
                switch (value as TaskStatus) {
                    case TaskStatus.NOT_STARTED:
                        return <Tag color={"cyan"}>?????????</Tag>
                    case TaskStatus.IN_PROGRESS:
                        return <Tag color={"green"}>?????????</Tag>
                    case TaskStatus.ABANDONED:
                        return <Tag color={"#f50"}>?????????</Tag>
                    case TaskStatus.DONE:
                        return <Tag color={"#87d068"}>?????????</Tag>
                    default:
                        return ""
                }
            }
        },
        {
            title: "????????????",
            dataIndex: "started_at",
            render: value => moment(value).format("YYYY-MM-DD HH:mm:ss")
        },
        {
            title: "????????????",
            dataIndex: "ended_at",
            render: value => moment(value).format("YYYY-MM-DD HH:mm:ss")
        },
        {
            title: "??????",
            render: (value, record) => {
                return <>
                    <Button type={"link"} onClick={() => onEdit(record)}>??????</Button>
                    <Popconfirm title={"??????????????????"} onConfirm={() => onDelete(record.id)}>
                        <Button type={"link"}>??????</Button>
                    </Popconfirm>
                </>
            }
        }
    ] as ColumnProps<ITask>[], [users, onEdit, onDelete]);

    return <div className={"w-full h-full bg-white p-4 flex flex-col"}>
        <div className={"w-full flex justify-between mb-4 pl-3"}>
            <Form form={queryForm} layout={"inline"} onFinish={onQuery} onReset={onQuery}>
                <Form.Item label={"????????????"} name={"user_id"} className={"!mb-4"}>
                    <Select allowClear placeholder={"???????????????"} className={"!w-40"}>
                        {
                            users?.data?.map(u => <Select.Option key={u.id} value={u.id}>{u.nickname}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
                <Form.Item label={"????????????"} name={"task_name"} className={"!mb-4"}>
                    <Input placeholder={"?????????????????????"} className={"!w-40"}/>
                </Form.Item>
                <Form.Item label={"????????????"} name={"status"} className={"!mb-4"}>
                    <Select allowClear placeholder={"?????????????????????"} className={"!w-40"}>
                        <Select.Option value={TaskStatus.NOT_STARTED}>?????????</Select.Option>
                        <Select.Option value={TaskStatus.IN_PROGRESS}>?????????</Select.Option>
                        <Select.Option value={TaskStatus.ABANDONED}>?????????</Select.Option>
                        <Select.Option value={TaskStatus.DONE}>?????????</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label={"????????????"} name={"started_at"} className={"!mb-4"}>
                    <DatePicker showTime placeholder={"??????????????????"} className={"!w-40"}/>
                </Form.Item>
                <Form.Item label={"????????????"} name={"ended_at"} className={"!mb-4"}>
                    <DatePicker showTime placeholder={"??????????????????"} className={"!w-40"}/>
                </Form.Item>
                <Form.Item className={"!mb-4"}>
                    <Button type={"primary"} htmlType={"submit"} icon={<SearchOutlined/>}>??????</Button>
                    <Divider type={"vertical"}/>
                    <Button type={"primary"} htmlType={"reset"}>??????</Button>
                </Form.Item>
            </Form>
            <Button type={"primary"} icon={<PlusOutlined/>} onClick={onAddTask}>??????</Button>
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
                       showTotal: (total) => `??? ${total} ?????????`,
                       onChange: onPageChange
                   }}/>
        </div>
        <Modal title={"????????????"} visible={visible} onOk={onFinish} onCancel={onCancel}>
            <Form form={form} labelCol={{span: 4}}>
                <Form.Item label={"??????"} name={"user_id"} rules={[{required: true}]}>
                    <Select allowClear placeholder={"???????????????"}>
                        {
                            users?.data?.map(u => <Select.Option key={u.id} value={u.id}>{u.nickname}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
                <Form.Item label={"????????????"} name={"task_name"} rules={[{required: true}]}>
                    <Input placeholder={"?????????????????????"}/>
                </Form.Item>
                {
                    id != null && <Form.Item label={"????????????"} name={"status"} rules={[{required: true}]}>
                        <Select allowClear placeholder={"?????????????????????"}>
                            <Select.Option value={TaskStatus.NOT_STARTED}>?????????</Select.Option>
                            <Select.Option value={TaskStatus.IN_PROGRESS}>?????????</Select.Option>
                            <Select.Option value={TaskStatus.ABANDONED}>?????????</Select.Option>
                            <Select.Option value={TaskStatus.DONE}>?????????</Select.Option>
                        </Select>
                    </Form.Item>
                }
                <Form.Item label={"????????????"} name={"started_at"} rules={[{required: true}]}>
                    <DatePicker showTime placeholder={"??????????????????"}/>
                </Form.Item>
                <Form.Item label={"????????????"} name={"ended_at"} rules={[{required: true}]}>
                    <DatePicker showTime placeholder={"??????????????????"}/>
                </Form.Item>
            </Form>
        </Modal>
    </div>
}

export default Task;