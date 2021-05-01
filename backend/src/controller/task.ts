import { Router, Request, Response } from 'express'
import { Task } from '../entity/task'

const router = Router();
export class TaskDesc {
    id = 0;
    sampleId = 0;
    pigment: string[] = [];
    pigmentWeight: number[] = [];
    sampleWeight = 0;
    resultFilename = '';
    resultContent = '';
    addTime = new Date;
    finishTime = new Date;
    status = '';
}

async function getTasks(request: Request, response: Response) {
    let task = await Task.find(request.query.status
        ? { where: { status: 'unfinished' } }
        : {
            select: [
                'id',
                'sampleId',
                'pigment',
                'pigmentWeight',
                'sampleWeight',
                'resultFilename',
                'addTime',
                'finishTime',
                'status',
            ]
        });

    response.json(task.map((val) => {
        return {
            id: val.id,
            sampleId: val.sampleId,
            pigment: val.pigment.split(','),
            pigmentWeight: val.pigmentWeight.split(',').map(v => parseFloat(v)),
            sampleWeight: val.sampleWeight,
            resultFilename: val.resultFilename,
            addTime: val.addTime,
            finishTime: val.finishTime,
            status: val.status
        } as TaskDesc
    }))
    return;
}

async function getTasksContent(request: Request, response: Response) {
    response.json(await Task.find());
    return;
}

class AddTaskRequest {
    sampleId = 0;
    pigment: string[] = [];
    pigmentWeight: number[] = [];
    sampleWeight = 0;
}

async function addTask(request: Request, response: Response) {
    if (null != await Task.findOne({ where: { status: 'unfinished' } })) {
        response.status(500).json({ msg: 'Already have a unfinished task.' })
        return
    }

    let newTask = new Task();
    let params: AddTaskRequest = request.body;
    newTask.sampleId = params.sampleId;
    newTask.pigment = params.pigment.join(',');
    newTask.pigmentWeight = params.pigmentWeight.join(',');
    newTask.sampleWeight = params.sampleWeight;
    newTask.resultFilename = '';
    newTask.resultContent = '';
    newTask.addTime = new Date(Date.now());
    newTask.finishTime = new Date();
    newTask.status = 'unfinished';
    await newTask.save();
    response.json(newTask);
}

class SubmitTaskResultRequest {
    filename: string;
    content: string;
}

async function submitTaskResult(request: Request, response: Response) {
    let task = await Task.findOne({ where: { id: request.params.taskId } });
    if (!task) {
        response.status(404).json({ msg: 'Can not find the task' });
        return;
    }
    task.finishTime = new Date(Date.now());
    task.status = 'finished';
    let req: SubmitTaskResultRequest = request.body;
    task.resultContent = req.content;
    task.resultFilename = req.filename;
    task.save();
    response.json({ msg: 'ok' });
}

async function getTaskResult(request: Request, response: Response) {
    let task = await Task.findOne({ where: { id: request.params.taskId } });
    if (!task) {
        response.status(404).json({ msg: 'can not find the task' });
        return;
    }
    if (task.status != 'finished') {
        response.status(500).json({ msg: 'task have not finished yet' });
        return;
    }
    return response.json({
        content: task.resultContent
    });
}

router.route('/')
    .get(getTasks)
    .post(addTask);

router.route('/:taskId')
    .post(submitTaskResult);

router.route('/result')
    .get(getTasksContent);

export default router;