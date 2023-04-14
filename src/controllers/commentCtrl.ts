import { NextFunction, Request, Response } from "express";
import { IReqAuth } from "../config/interface"
import { ApiError } from "../utils/apiErrors";
import Comments from '../models/commentModel'
import mongoose from "mongoose";


const Pagination = (req: IReqAuth) => {
    let page = Number(req.query.page) * 1 || 1;
    let limit = Number(req.query.limit) * 1 || 4;
    let skip = (page - 1) * limit;

    return { page, limit, skip };
}
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

    getComments= async (req: Request, res: Response,next:NextFunction) => {
    const { limit, skip } = Pagination(req)

    try {
        const data = await Comments.aggregate([
            {
                $facet: {
                    totalData: [
                        {
                            $match: {
                                blog_id: new mongoose.Types.ObjectId(req.params.id),
                                comment_root: { $exists: false },
                                reply_user: { $exists: false }
                            }
                        },
                        {
                            $lookup: {
                                "from": "users",
                                "let": { user_id: "$user" },
                                "pipeline": [
                                    { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                    { $project: { name: 1, avatar: 1 } }
                                ],
                                "as": "user"
                            }
                        },
                        { $unwind: "$user" },
                        {
                            $lookup: {
                                "from": "comments",
                                "let": { cm_id: "$replyCM" },
                                "pipeline": [
                                    { $match: { $expr: { $in: ["$_id", "$$cm_id"] } } },
                                    {
                                        $lookup: {
                                            "from": "users",
                                            "let": { user_id: "$user" },
                                            "pipeline": [
                                                { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                                { $project: { name: 1, avatar: 1 } }
                                            ],
                                            "as": "user"
                                        }
                                    },
                                    { $unwind: "$user" },
                                    {
                                        $lookup: {
                                            "from": "users",
                                            "let": { user_id: "$reply_user" },
                                            "pipeline": [
                                                { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                                { $project: { name: 1, avatar: 1 } }
                                            ],
                                            "as": "reply_user"
                                        }
                                    },
                                    { $unwind: "$reply_user" }
                                ],
                                "as": "replyCM"
                            }
                        },
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        {
                            $match: {
                                blog_id: new mongoose.Types.ObjectId(req.params.id),
                                comment_root: { $exists: false },
                                reply_user: { $exists: false }
                            }
                        },
                        { $count: 'count' }
                    ]
                }
            },
            {
                $project: {
                    count: { $arrayElemAt: ["$totalCount.count", 0] },
                    totalData: 1
                }
            }
        ])
        const comments = data[0].totalData;
        const count = data[0].count;

        let total = 0;

        if (count % limit === 0) {
            total = count / limit;
        } else {
            total = Math.floor(count / limit) + 1;
        }

        return res.json({ comments, total })

    } catch (error) {
        next(error)
    }
    }
    
    replyComment = async (req: IReqAuth, res: Response,next:NextFunction) => {
       try {
            if (!req.user) throw ApiError.UnauthorizedError();
        const {
            content,
            blog_id,
            blog_user_id,
            comment_root,
            reply_user
        } = req.body


        const newComment = new Comments({
            user: req.user._id,
            content,
            blog_id,
            blog_user_id,
            comment_root,
            reply_user: reply_user._id
        })

        await Comments.findOneAndUpdate({ _id: comment_root }, {
            $push: { replyCM: newComment._id }
        })

        await newComment.save()

        return res.json(newComment)

    } catch (error) {
        next(error)
    }
}
}

export default new CommentController()