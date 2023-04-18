import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes/index';
import { errorMiddleware } from './middleware/error';

//import Application constants
import constants from './constants/index';

import { createServer } from 'http'
//import socket io
import  { Server, Socket } from 'socket.io'



//Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    credentials: true,
    origin: ["https://blog-ulfatli.netlify.app",'http://localhost:3000']
}));
app.use(cookieParser());
app.use(morgan('dev'));

//socket 
const http = createServer(app);
export const io = new Server(http, {
    cors: {
        credentials: true,
        origin: ["https://blog-ulfatli.netlify.app",'http://localhost:3000']
    }
});
 import {SocketServer} from './config/socket'
io.on("connection", (socket: Socket) => SocketServer(socket));


//Routes
app.use('/api', routes.authRouter)
app.use('/api', routes.userRouter)
app.use('/api', routes.categoryRouter)
app.use('/api', routes.blogRouter)
app.use('/api', routes.commentRouter)




//error middleware
app.use(errorMiddleware)

//DB
import './config/database'

//server listening

http.listen(constants.PORT, () => {
    console.log('Server is running on port', constants.PORT)
});