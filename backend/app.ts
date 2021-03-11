import express, { NextFunction, Response } from 'express'
import { createConnection } from 'typeorm';
import bodyParser from 'body-parser';
import task from './src/controller/task';
import expressJwt from 'express-jwt';
import { IUserRequest } from './src/types/request';

createConnection().then(connection => {
    // Our Express APP config
    const app = express();

    app.set("port", process.env.PORT || 3000);

    app.use(bodyParser.json());

    app.use('/api/task', task);

    const server = app.listen(app.get("port"))

    console.log(`App is running on http://localhost:${app.get("port")} in ${app.get("env")} mode`);
}).catch(err => {
    console.log(err)
})
