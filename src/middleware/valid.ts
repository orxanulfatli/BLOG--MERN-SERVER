import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiErrors';

export const validRegister = async (req: Request, res: Response, next: NextFunction) => {
    const { name, account, password } = req.body;

    const errors = []
    //validate name
    if (!name) {
        errors.push('Please add your name.')
    } else if (name.length > 20) {
        errors.push("Your name is up to 20 chars long")
    }

    //validate account email or phonenumber
    if (!account) {
        errors.push('Please add your email or phone number.')
    } else if (!validPhone(account) && !validateEmail(account)) {
        errors.push("Email or phone number format is incorrect.")
    }

    //validate password
    if (password.length < 6) {
        errors.push("Password must be at least 6 chars.")
    }

    if (errors.length > 0) return res.status(400).json({ errors })

    next();


}


export function validPhone(phone: string) {
    const re = /^[+]/g
    return re.test(phone)
}

export function validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const validCategory = async (req: Request, res: Response, next: NextFunction) => {
 try {
     const { name } = req.body;

     const errors = []
     //validate name
     if (!name) {
         errors.push('Please add category .')
     } else if (name.length > 50) {
         errors.push("Category name is up to 50 chars long.")
     }

     if (errors.length > 0) throw ApiError.BadRequest('some', errors)

     next();
 } catch (error) {
     next(error)
 }


}