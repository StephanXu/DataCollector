import { Router, Request, Response } from 'express'
import { Task } from '../entity/task'

const router = Router();

async function getTasks(request: Request, response: Response) {
    if (request.query.status) {
        response.json(await Task.find({ where: { status: 'unfinished' } }));
        return
    }
    response.json(await Task.find());
    return;
}

class AddTaskRequest {
    sampleId: number;
    pigment: string;
    pigmentWeight: number;
    sampleWeight: number;
}

async function addTask(request: Request, response: Response) {
    if (null != await Task.findOne({ where: { status: 'unfinished' } })) {
        response.status(500).json({ msg: 'Already have a unfinished task.' })
        return
    }

    let newTask = new Task();
    let params: AddTaskRequest = request.body;
    newTask.sampleId = params.sampleId;
    newTask.pigment = params.pigment;
    newTask.pigmentWeight = params.pigmentWeight;
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

router.route('/')
    .get(getTasks)
    .post(addTask);

router.route('/:taskId')
    .post(submitTaskResult);

export default router;