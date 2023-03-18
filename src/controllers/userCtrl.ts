import { Response, NextFunction } from "express";
import { IReqAuth } from "../config/interface";
import { ApiError } from "../utils/apiErrors";
import Users from "../models/userModel";
import bcrypt from "bcrypt";


class UserController {
  updateUser = async (req: IReqAuth, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.UnauthorizedError();

      const { _id } = req.user;
      const { name,avatar } = req.body;
      if (name) { await Users.findByIdAndUpdate({ _id }, { name }); }
      if (avatar) { await Users.findByIdAndUpdate({ _id }, { avatar }); }

      res.json({ success: true, message: "Update Success!" });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: IReqAuth, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw ApiError.UnauthorizedError();
      if (req.user.type !== 'register') throw ApiError.BadRequest(`Quick login account with ${req.user.type} can't use this function`)
      
      const { password } = req.body
      const passwordHash = await bcrypt.hash(password, 12)
      await Users.findOneAndUpdate({ _id: req.user._id }, {
        password: passwordHash
      })
      res.json({ success: true, message: "Reset Password Success!" });

    } catch (error) {
        next(error)
    }
  }
}

export default new UserController();
