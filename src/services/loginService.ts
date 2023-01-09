import Users from '../models/userModel';
import { ApiError } from '../utils/apiErrors';
import bcrypt from 'bcrypt';
import {generateAccessToken,generateRefreshToken} from '../config/generateToken'

class LoginService {
    login = async (password: string, account: string) => {
        
         //check user is exist or not
        const user = await Users.findOne({ account }); 
        if (!user) {
            throw ApiError.BadRequest('This account does not exist!')
        }
        
        //check password match or not 
        const isPasswordMatched = await bcrypt.compare(password,user.password);
        if (!isPasswordMatched) {
            throw ApiError.BadRequest('"Invalid email address or password')
        }

       //generate tokens
        const accessToken = generateAccessToken({id:user._id});
        const refreshToken = generateRefreshToken({ id: user._id })
        
        return {
            accessToken,
            refreshToken,
            user:{...user._doc,password:''}
        }

        
    }
 };

export default new LoginService();