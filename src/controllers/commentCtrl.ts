import { NextFunction, Response } from "express";
import { IReqAuth } from "../config/interface"
import { ApiError } from "../utils/apiErrors";
import Comments from '../models/commentModel'

class CommentController {
    createComment = async (req:IReqAuth,res:Response,next:NextFunction) => {
     try {
         if (!req.user) throw ApiError.UnauthorizedError();
         const {
             content,
             blog_id,
             blog_user_id
         } = req.body

         const newComment = new Comments({
             user: req.user._id,
             content,
             blog_id,
             blog_user_id
         });
         await newComment.save()

         return res.json(newComment)
     } catch (error) {
         next(error)
     }
    }
}

export default new CommentController()