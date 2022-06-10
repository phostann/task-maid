import {baseApi, Response} from "./service";

export enum TaskStatus {
    DONE = 'done',
    IN_PROGRESS = 'in_progress',
    NOT_STARTED = 'not_started',
    ABANDONED = 'abandoned',
}


export interface Task {
    id: number
    user_id: number
    task_name: string
    started_at: string
    ended_at: string
    status: TaskStatus
    created_at: string
    updated_at: string
    deleted_at: string
}

interface CreateTaskReq {
    user_id: number
    task_name: string
    started_at: string
    ended_at: string
    status: TaskStatus
}

interface UpdateTaskReq {
    id: number
    user_id: number
    task_name: string
    started_at: string
    ended_at: string
    status: TaskStatus
}

interface ListTaskReq {
    page: number
    page_size: number
    user_id?: number
    task_name?: string
    started_at?: string
    ended_at?: string
    status?: TaskStatus
}

export const taskApi = baseApi.injectEndpoints({
    endpoints: build => ({
        listTasks: build.query<Response<Task[]>, ListTaskReq>({
            query: (params) => ({
                url: '/tasks',
                params
            }),
            providesTags: [{type: "Task", id: "LIST"}]
        }),
        createTask: build.mutation<Response<Task>, CreateTaskReq>({
            query: (data) => ({
                url: "/task",
                method: "POST",
                body: data
            }),
            invalidatesTags: [{type: "Task", id: "LIST"}]
        }),
        updateTask: build.mutation<Response<Task>, UpdateTaskReq>({
            query: (data) => ({
                url: `/task/${data.id}`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: [{type: "Task", id: "LIST"}]
        }),
        deleteTask: build.mutation<Response<Task>, number>({
            query: (id) => ({
                url: `/task/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: [{type: "Task", id: "LIST"}]
        })
    })
});

export const {useListTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation} = taskApi;