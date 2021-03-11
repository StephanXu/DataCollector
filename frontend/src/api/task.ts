import request from '@/utils/request'

export class AddTaskRequest {
    sampleId = 0;
    pigment = '';
    pigmentWeight = 0;
    sampleWeight = 0;
}

export class Task {
    id = 0;
    sampleId = 0;
    pigment = '';
    pigmentWeight = 0;
    sampleWeight = 0;
    resultFilename = '';
    resultContent = '';
    addTime = new Date;
    finishTime = new Date;
    status = '';
}

export function addTask(data: AddTaskRequest) {
    return request.request<Task>({
        url: '/task',
        method: 'post',
        data
    }).then(res => res.data);
}

export function fetchTask() {
    return request.request<Task[]>({
        url: '/task',
        method: 'get'
    }).then(res => res.data)
}

export function fetchUnfinishedTask() {
    return request.request<Task[]>({
        url: '/task',
        method: 'get',
        params: {
            status: 'unfinished'
        }
    }).then(res => res.data)
}