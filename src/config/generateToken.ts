import jwt from 'jsonwebtoken';
import constants from '../constants/index';

export const generateActiveToken = (payload: object) => {
    return jwt.sign(payload, `${constants.ACTIVE_TOKEN_SECRET}`, { expiresIn: '5m' })
}

export const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, `${constants.ACCESS_TOKEN_SECRET}`, { expiresIn: '15m' })
}

export const generateRefreshToken = (payload: object) => {
    return jwt.sign(payload, `${constants.REFRESH_TOKEN_SECRET}`, { expiresIn: '30d' })
}