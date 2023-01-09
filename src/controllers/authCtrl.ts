import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiErrors';

import Users from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateActiveToken } from '../config/generateToken';
import sendMail from '../config/sendMail';
import { validateEmail,validPhone } from '../middleware/valid';
import { sendSms } from '../config/sendSMS';
import { INewUser, IDecodedToken } from '../config/interface'
import loginService from '../services/loginService';
import tokenService from '../services/tokenService';


const CLIENT_URL = `${process.env.BASE_URL}`

class AuthCtrl {
    register = async (req: Request, res: Response) => {
        try {
            const { name, account, password } = req.body;
            const user = await Users.findOne({ account });
            if (user) return res.status(400).json({ msg: 'Email or Phone number already exists.' });

            const passwordHash = await bcrypt.hash(password, 12)
            const newUser = {
                name,account,password:passwordHash
            }
            
            const activeToken = generateActiveToken({ newUser })

            const url = `${CLIENT_URL}/active/${activeToken}`
            if (validateEmail(account)) {
                sendMail(account, url, 'Verify your email address.');
                return res.json({msg:'Success! Please check your email.'})
            } else if (validPhone(account)) {
                sendSms(account, url, 'Verify your phone number')
                return res.json({ msg: 'Success! Please check your phone.' })
            }
            res.json({
                msg: 'Register successfully.',
                data: newUser,
                activeToken
            })

        } catch (error: any) {
            return res.status(500).json({ msg: error.message })
        }
    }

    activeAccount = async (req: Request, res: Response) => {
        try {
            const { activeToken } = req.body;
            const decoded = <IDecodedToken>jwt.verify(activeToken, `${process.env.ACTIVE_TOKEN_SECRET}`);
            const { newUser } = decoded
            
            if (!newUser) return res.status(400).json({ msg: "Invalid authentication." })

            const user = new Users(newUser)
            await user.save()

            res.json({ msg: "Account has been activated!" })
        } catch (err: any) {
            let errMsg;

            if (err.code === 11000) {
                errMsg = Object.keys(err.keyValue)[0] + " already exists."
            } else {
                let name = Object.keys(err.errors)[0]
                errMsg = err.errors[`${name}`].message
            }

            return res.status(500).json({ msg: errMsg })
        }
    }

    login = async (req: Request, res: Response,next:NextFunction) => {
        try {
            const { account, password } = req.body;
            
            const { accessToken, refreshToken, user } = await loginService.login(password, account)
            
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: `/api/refresh_token`,
                maxAge: 30 * 24 * 60 * 60 * 1000,//30 days
            })
            
            res.json({msg:'Login Success!',accessToken,user})
        } catch (err:any) {
            next(err)
        }
    }

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie('refreshToken', {
                path: `/api/refresh_token`
            })

            return res.json({msg:'Logged out!'})
        } catch (error) {
            next(error)
        }
    }

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                throw ApiError.UnauthorizedError()
            }

            //validate refres token
            const decoded = <IDecodedToken>tokenService.validateRefreshToken(refreshToken)
            if (!decoded) {
                throw ApiError.UnauthorizedError()
            }

            const user = await Users.findById(decoded.id).select('-password');
            if (!user) {
                throw ApiError.BadRequest('This account does not exist.')
            }

            const accessToken = generateAccessToken({ id: user.id })
            //you must also generate new refresh token and send with cookie and 
            //dont forget model in db for refresh token
            res.json({msg:'Success!',accessToken})
        } catch (error) {
            next(error)
        }
    }
}

export default new AuthCtrl();