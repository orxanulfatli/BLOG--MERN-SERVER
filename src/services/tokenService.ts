import jwt from 'jsonwebtoken';
import { IDecodedToken } from '../config/interface';
import constants from '../constants/index';

class TokenService {
    validateActiveToken = (token: string) => {
        try {
            return <IDecodedToken>jwt.verify(token, `${constants.ACTIVE_TOKEN_SECRET}`);
        } catch (error) {
            return null
        }
    }
    validateAccessToken = (token:string) => {
        try {
            return <IDecodedToken>jwt.verify(token, `${constants.ACCESS_TOKEN_SECRET}`);
        } catch (error) {
            return null
        }
    }

    validateRefreshToken = (token:string) => {
        try {
            return <IDecodedToken>jwt.verify(token, `${constants.REFRESH_TOKEN_SECRET}`); 
        } catch (error) {
            return null
        }
    }
}

export default new TokenService()