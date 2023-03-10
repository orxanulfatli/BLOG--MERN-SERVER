import {Document} from 'mongoose'

export interface IUser extends Document {
    name: string
    account: string
    password: string
    avatar: string
    role: string
    type: string
    _doc:Object
    
 }

export interface INewUser {
    name: string
    account: string
    password: string
}
export interface IUserData {
    refreshToken: string,
    accessToken: string,
    user:IUser
}
export interface IDecodedToken {
    id?:string
    newUser?: INewUser
    iat: number
    exp: number
}
export interface IUserParams {
    name: string
    account: string
    password: string
    avatar?: string
    type: string
}