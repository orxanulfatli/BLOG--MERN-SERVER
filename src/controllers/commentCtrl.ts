import { NextFunction, Request, Response } from "express";
import { IReqAuth } from "../config/interface"
import { ApiError } from "../utils/apiErrors";
import Comments from '../models/commentModel'
import mongoose from "mongoose";
import {io} from '../index'


const Pagination = (req: IReqAuth) => {
    let page = Number(req.query.page) * 1 || 1;
    let limit = Number(req.query.limit) * 1 || 4;
    let skip = (page - 1) * limit;

    return { page, limit, skip };
}
class CommentController {
    createComment = async (req: IReqAuth, res: Response, next: NextFunction) => {
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

            const data = {
                ...newComment._doc,
                user: req.user,
                createdAt: new Date().toISOString()
            }

            io.to(`${blog_id}`).emit('createComment', data)
            await newComment.save()
          

            return res.json(newComment)
        } catch (error) {
            next(error)
        }
    }

    getComments = async (req: Request, res: Response, next: NextFunction) => {
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

    replyComment = async (req: IReqAuth, res: Response, next: NextFunction) => {
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
            const data = {
                ...newComment._doc,
                user: req.user,
                reply_user: reply_user,
                createdAt: new Date().toISOString()
            }

            io.to(`${blog_id}`).emit('replyComment', data)
            await newComment.save()

            return res.json(newComment)

        } catch (error) {
            next(error)
        }
    }

    updateComment = async (req: IReqAuth, res: Response, next: NextFunction) => {


        try {
            if (!req.user) throw ApiError.UnauthorizedError();
            const { data } = req.body
            console.log(data.content)

            const comment = await Comments.findOneAndUpdate({
                _id: req.params.id, user: req.user.id
            }, { content:data.content })

            if (!comment) {
                throw ApiError.BadRequest("Comment does not exits.")
            }
            io.to(`${data.blog_id}`).emit('updateComment', data)

            return res.json({ message: "Update Success!" })

        } catch (error) {
            next(error)
        }
    }

    deleteComment = async (req: IReqAuth, res: Response, next: NextFunction) => {

        try {
            if (!req.user) throw ApiError.UnauthorizedError();
            const comment = await Comments.findOneAndDelete({
                _id: req.params.id,
                $or: [
                    { user: req.user._id },
                    { blog_user_id: req.user._id }
                ]
            })

            if (!comment) throw ApiError.BadRequest("Comment does not exits.")

            if (comment.comment_root) {
                // update replyCM
                await Comments.findOneAndUpdate({ _id: comment.comment_root }, {
                    $pull: { replyCM: comment._id }
                })
            } else {
                // delete all comments in replyCM
                await Comments.deleteMany({ _id: { $in: comment.replyCM } })
            }

            io.to(`${comment.blog_id}`).emit('deleteComment', comment)

            return res.json({ message: "Delete Success!" })

        } catch (error) {
            next(error)
        }
    }
}

export default new CommentController()