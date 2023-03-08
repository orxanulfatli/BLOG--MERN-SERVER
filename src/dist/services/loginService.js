"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const apiErrors_1 = require("../utils/apiErrors");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateToken_1 = require("../config/generateToken");
class LoginService {
    constructor() {
        this.login = (password, account) => __awaiter(this, void 0, void 0, function* () {
            //check user is exist or not
            const user = yield userModel_1.default.findOne({ account });
            if (!user) {
                throw apiErrors_1.ApiError.BadRequest('This account does not exist!');
            }
            //check password match or not 
            const isPasswordMatched = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordMatched) {
                throw apiErrors_1.ApiError.BadRequest('"Invalid email address or password');
            }
            //generate tokens
            const accessToken = (0, generateToken_1.generateAccessToken)({ id: user._id });
            const refreshToken = (0, generateToken_1.generateRefreshToken)({ id: user._id });
            return {
                accessToken,
                refreshToken,
                user: Object.assign(Object.assign({}, user._doc), { password: '' })
            };
        });
    }
}
;
exports.default = new LoginService();
