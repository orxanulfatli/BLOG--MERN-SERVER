import { NextFunction, Request, Response } from "express";
import { IReqAuth } from "../config/interface";
import { ApiError } from "../utils/apiErrors";
import tokenService from "../services/tokenService";
import Users from '../models/userModel'


export const auth =async (req: IReqAuth,res:Response,next:NextFunction) => {
   try {
       const authorizationHeader = req.header('Authorization')
       if (!authorizationHeader) return next(ApiError.UnauthorizedError());

       const accessToken = authorizationHeader.split(' ')[1]
       if (!accessToken) return next(ApiError.UnauthorizedError())

       const decoded = tokenService.validateAccessToken(accessToken)
       if (!decoded) return next(ApiError.UnauthorizedError())

       const user = await Users.findOne({ _id: decoded.id });
       if (!user) return next(ApiError.BadRequest('user does not exist'))
       
       req.user = user
       next()
      
   } catch (error:any) {
       next(ApiError.UnauthorizedError())
   }
}