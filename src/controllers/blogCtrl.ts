import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose";
import { IReqAuth } from "../config/interface"
import { ApiError } from "../utils/apiErrors";
import Blogs from '../models/blogModel'

const Pagination = (req: IReqAuth) => {
    let page = Number(req.query.page) * 1 || 1;
    let limit = Number(req.query.limit) * 1 || 4;
    let skip = (page - 1) * limit;

    return { page, limit, skip };
}
class BlogController {
    createBlog = async (req:IReqAuth,res:Response,next:NextFunction) => {
        try {
            if (!req.user) throw ApiError.UnauthorizedError();
            const { title, content, description, thumbnail, category } = req.body;
            const newBlog = new Blogs({
                user: req.user._id,
                title,
                content,
                description,
                thumbnail,
                category
            });
            await newBlog.save();
            res.json(newBlog )
        } catch (error) {
            next(error)
        }
    }

    getHomeBlogs = async (req: Request, res: Response,next:NextFunction) => {
    try {
        const blogs = await Blogs.aggregate([
            // User
            {
                $lookup: {
                    from: "users",
                    let: { user_id: "$user" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                        { $project: { password: 0 } }
                    ],
                    as: "user"
                }
            },
            // array -> object
            { $unwind: "$user" },
            // Category
            {
                $lookup: {
                    "from": "categories",
                    "localField": "category",
                    "foreignField": "_id",
                    "as": "category"
                }
            },
            // array -> object
            { $unwind: "$category" },
            // Sorting
            { $sort: { createdAt: 1 } },
            // Group by category
            {
                $group: {
                    _id: "$category._id",
                    name: { $first: "$category.name" },
                    blogs: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            },
            // Pagination for blogs
            {
                $project: {
                    blogs: {
                        $slice: ['$blogs', 0, 4]
                    },
                    count: 1,
                    name: 1
                }
            }
        ])

        res.json(blogs)

    } catch (error: any) {
       next(error)
       
    }
    }
    
    getBlogsByCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, skip } = Pagination(req)
            const Data = await Blogs.aggregate([
                {
                    $facet: {
                        totalData: [
                            {
                                $match: {
                                    category: new mongoose.Types.ObjectId(req.params.id)
                                }
                            },
                            // User
                            {
                                $lookup: {
                                    from: "users",
                                    let: { user_id: "$user" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                        { $project: { password: 0 } }
                                    ],
                                    as: "user"
                                }
                            },
                            // array -> object
                            { $unwind: "$user" },
                            // Sorting
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        totalCount: [
                            {
                                $match: {
                                    category: new mongoose.Types.ObjectId(req.params.id)
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

            const blogs = Data[0].totalData;
            const count = Data[0].count;

            // Pagination
            let total = 0;

            if (count % limit === 0) {
                total = count / limit;
            } else {
                total = Math.floor(count / limit) + 1;
            }

            res.json({ blogs, total })
        } catch (error) {
            next(error)
        }
    };

    getBlogsByUser = async (req: Request, res: Response) => {
    const { limit, skip } = Pagination(req)

    try {
        const Data = await Blogs.aggregate([
            {
                $facet: {
                    totalData: [
                        {
                            $match: {
                                user: new mongoose.Types.ObjectId(req.params.id)
                            }
                        },
                        // User
                        {
                            $lookup: {
                                from: "users",
                                let: { user_id: "$user" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                    { $project: { password: 0 } }
                                ],
                                as: "user"
                            }
                        },
                        // array -> object
                        { $unwind: "$user" },
                        // Sorting
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        {
                            $match: {
                                user:new mongoose.Types.ObjectId(req.params.id)
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

        const blogs = Data[0].totalData;
        const count = Data[0].count;

        // Pagination
        let total = 0;

        if (count % limit === 0) {
            total = count / limit;
        } else {
            total = Math.floor(count / limit) + 1;
        }

        res.json({ blogs, total })
    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}
};
 
export default new BlogController()
