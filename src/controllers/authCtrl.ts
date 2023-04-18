import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiErrors";

import Users from "../models/userModel";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateActiveToken,
  generateRefreshToken,
} from "../config/generateToken";
import sendMail from "../config/sendMail";
import mailService from "../services/mailService";
import { validateEmail, validPhone } from "../middleware/valid";
import { sendSms, smsOTP, smsVerify } from "../config/sendSMS";
import { INewUser, IDecodedToken, IUserParams } from "../config/interface";
import loginService from "../services/loginService";
import tokenService from "../services/tokenService";
import { nextTick } from "process";

const CLIENT_URL = `${process.env.BASE_URL}`;
/*you can make register and activation same in heroku first in register get only 
name and account then in activation get password and activate account and login in*/
class AuthCtrl {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, account, password } = req.body;
      const user = await Users.findOne({ account });
      if (user)
        throw ApiError.BadRequest("Email or Phone number already exists.");

      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = {
        name,
        account,
        password: passwordHash,
      };

      const activeToken = generateActiveToken({ newUser });

      const url = `${CLIENT_URL}/active/${activeToken}`;
      if (validateEmail(account)) {
        mailService.sendActivationEmail(account, url, "Verify your email address.");
        return res.json({
          success: true,
          message: "Success! Please check your email to activate you account.",
        });
      } else if (validPhone(account)) {
        sendSms(account, url, "Verify your phone number");
        return res.json({
          success: true,
          message: "Success! Please check your phone to activate you account.",
        });
      }
      res.json({
        message: "Register successfully.",
        data: newUser,
        activeToken,
      });
    } catch (error: any) {
      next(error);
    }
  };

  activateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activeToken } = req.body;

      const decoded = tokenService.validateActiveToken(activeToken);
      if (!decoded) {
        return next(ApiError.BadRequest("Invalid authentication."));
      }
      const user = await Users.findOne({ account: decoded.newUser?.account });
      if (user) {
        return next(ApiError.BadRequest("Account already activated"));
      }
      const newUser = new Users(decoded.newUser);
      await newUser.save();

      res.json({ message: "Account has been activated!" });
    } catch (err: any) {
      // let errMsg;

      // if (err.code === 11000) {
      //     errMsg = Object.keys(err.keyValue)[0] + " already exists."
      // } else {
      //     let name = Object.keys(err.errors)[0]
      //     errMsg = err.errors[`${name}`].message
      // }

      // return res.status(500).json({ msg: errMsg })
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account, password } = req.body;
      const user = await Users.findOne({ account });
        
              //check user is exist or not
      if (!user) {
        throw ApiError.BadRequest("This account does not exist!");
      }

     const userData = await loginService.login(user,password);

      res.cookie("refreshToken", userData.refreshToken, {
        sameSite: 'none',
        secure:true,
        httpOnly: true,
        path: `/api/refresh_token`,
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
      });

      res.json({
        success: true,
        message: "Login Success!",
        accessToken: userData.accessToken,
        user: userData.user,
      });
    } catch (err: any) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("refreshToken", {
        path: `/api/refresh_token`,
      });

      return res.json({ msg: "Logged out!" });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw ApiError.UnauthorizedError();
      }

      //validate refres token
      const decoded = <IDecodedToken>(
        tokenService.validateRefreshToken(refreshToken)
      );
      if (!decoded) {
        throw ApiError.UnauthorizedError();
      }

      const user = await Users.findById(decoded.id).select("-password");
      if (!user) {
        throw ApiError.BadRequest("This account does not exist.");
      }

      const accessToken = generateAccessToken({ id: user.id });
      //you must also generate new refresh token and send with cookie and
      //dont forget model in db for refresh token
      res.json({ success: true, message: "Success!", accessToken, user });
    } catch (error) {
      next(error);
    }
  };

  sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone } = req.body;
      const data = await smsOTP(phone, "sms");
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, code } = req.body;
      const data =await  smsVerify(phone, code);
      if (!data) throw ApiError.BadRequest("Invalid Authentication");
      
      const password = phone + "your phone secrect password";
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await Users.findOne({ account: phone });
      if (user) {
          const userData = await loginService.login(user, password);
          res.cookie("refreshToken", userData.refreshToken, {
              httpOnly: true,
              path: `/api/refresh_token`,
              maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
          });

          res.json({
              success: true,
              message: "Login Success!",
              accessToken: userData.accessToken,
              user: userData.user,
          });
      } else {
          const user = {
              name: phone,
              account: phone,
              password: passwordHash,
              type: 'sms'
          }  
          registerUser(user, res)
      }
    } catch (error:any) {
      next(error);
    }
  };
}


const registerUser = async (user: IUserParams, res: Response) => {
    const newUser = new Users(user)
    await newUser.save()

    const accessToken = generateAccessToken({ id: newUser._id })
    const refreshToken = generateRefreshToken({ id: newUser._id })

    res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: `/api/refresh_token`,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
    })

  res.json({
        success: true,
        message: 'Login Success!',
        accessToken,
        user: { ...newUser._doc, password: '' }
    })

}
export default new AuthCtrl();
