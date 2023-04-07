import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes/index';
import { errorMiddleware } from './middleware/error';

//import Application constants
import constants from './constants/index';



//Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    credentials: true,
    origin:["http://localhost:3000"]
}));
app.use(cookieParser());
app.use(morgan('dev'))


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

app.listen(constants.PORT, () => {
    console.log('Server is running on port',constants.PORT)
})