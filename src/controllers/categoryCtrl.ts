import { Request, Response, NextFunction } from "express";
import { IReqAuth } from "../config/interface";
import { ApiError } from "../utils/apiErrors";
import Categories from "../models/categoryModel";

class CategoryController {
  createCategory = async (req: IReqAuth, res: Response, next: NextFunction) => {
      try {
      if (!req.user) throw ApiError.UnauthorizedError();
      if (req.user.role !== "admin") throw ApiError.UnauthorizedError();
      const name = req.body.name.toLowerCase();

      const newCategory = new Categories({ name });
      await newCategory.save();
   
      res.json({ newCategory });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await Categories.find().sort("-createdAt");
      res.json({ categories });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  };

  updateCategory = async (req: IReqAuth, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.UnauthorizedError();
      if (req.user.role !== "admin") throw ApiError.UnauthorizedError();
      await Categories.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        { name: req.body.name }
      );

      res.json({ msg: "Update Success!" });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: IReqAuth, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.UnauthorizedError();
      if (req.user.role !== "admin") throw ApiError.UnauthorizedError();
      await Categories.findByIdAndDelete(req.params.id);

      res.json({ msg: "Delete Success!" });
    } catch (error) {
      next(error);
    }
  };
}
export default new CategoryController();
