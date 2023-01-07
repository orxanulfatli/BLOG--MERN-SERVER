import { Request, Response } from 'express';
import Users from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateActiveToken } from '../config/generateToken';
import sendMail from '../config/sendMail';
import {validPhone,validateEmail} from '../middleware/valid'


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
}

export default new AuthCtrl();