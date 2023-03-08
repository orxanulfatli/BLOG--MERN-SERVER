import {Request,Response,NextFunction} from 'express'
import { ApiError } from "../utils/apiErrors";

export const errorMiddleware = (err:Error, req:Request, res:Response, next:NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ success: false, message: err.message, errors: err.errors })
    }
    return res.status(500).json({ success: false, message: 'Internal Server Error' })
}