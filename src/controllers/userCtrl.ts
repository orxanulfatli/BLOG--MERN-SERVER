import { Response, NextFunction } from "express";
import { IReqAuth } from "../config/interface";
import { ApiError } from "../utils/apiErrors";
import Users from "../models/userModel";

class UserController {
  updateUser = async (req: IReqAuth, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.UnauthorizedError();

      const { _id } = req.user;
      const { name } = req.body;
      await Users.findByIdAndUpdate({ _id }, { name });
      res.json({ success: true, message: "Update Success!" });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
