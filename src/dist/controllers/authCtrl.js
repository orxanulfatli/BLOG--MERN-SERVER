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
const apiErrors_1 = require("../utils/apiErrors");
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken_1 = require("../config/generateToken");
const sendMail_1 = __importDefault(require("../config/sendMail"));
const valid_1 = require("../middleware/valid");
const sendSMS_1 = require("../config/sendSMS");
const loginService_1 = __importDefault(require("../services/loginService"));
const tokenService_1 = __importDefault(require("../services/tokenService"));
const CLIENT_URL = `${process.env.BASE_URL}`;
class AuthCtrl {
    constructor() {
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, account, password } = req.body;
                const user = yield userModel_1.default.findOne({ account });
                if (user)
                    return res.status(400).json({ msg: 'Email or Phone number already exists.' });
                const passwordHash = yield bcrypt_1.default.hash(password, 12);
                const newUser = {
                    name, account, password: passwordHash
                };
                const activeToken = (0, generateToken_1.generateActiveToken)({ newUser });
                const url = `${CLIENT_URL}/active/${activeToken}`;
                if ((0, valid_1.validateEmail)(account)) {
                    (0, sendMail_1.default)(account, url, 'Verify your email address.');
                    return res.json({ msg: 'Success! Please check your email.' });
                }
                else if ((0, valid_1.validPhone)(account)) {
                    (0, sendSMS_1.sendSms)(account, url, 'Verify your phone number');
                    return res.json({ msg: 'Success! Please check your phone.' });
                }
                res.json({
                    msg: 'Register successfully.',
                    data: newUser,
                    activeToken
                });
            }
            catch (error) {
                return res.status(500).json({ msg: error.message });
            }
        });
        this.activeAccount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { activeToken } = req.body;
                const decoded = jsonwebtoken_1.default.verify(activeToken, `${process.env.ACTIVE_TOKEN_SECRET}`);
                const { newUser } = decoded;
                if (!newUser)
                    return res.status(400).json({ msg: "Invalid authentication." });
                const user = new userModel_1.default(newUser);
                yield user.save();
                res.json({ msg: "Account has been activated!" });
            }
            catch (err) {
                let errMsg;
                if (err.code === 11000) {
                    errMsg = Object.keys(err.keyValue)[0] + " already exists.";
                }
                else {
                    let name = Object.keys(err.errors)[0];
                    errMsg = err.errors[`${name}`].message;
                }
                return res.status(500).json({ msg: errMsg });
            }
        });
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { account, password } = req.body;
                const { accessToken, refreshToken, user } = yield loginService_1.default.login(password, account);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    path: `/api/refresh_token`,
                    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
                });
                res.json({ msg: 'Login Success!', accessToken, user });
            }
            catch (err) {
                next(err);
            }
        });
        this.logout = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('refreshToken', {
                    path: `/api/refresh_token`
                });
                return res.json({ msg: 'Logged out!' });
            }
            catch (error) {
                next(error);
            }
        });
        this.refresh = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                if (!refreshToken) {
                    throw apiErrors_1.ApiError.UnauthorizedError();
                }
                //validate refres token
                const decoded = tokenService_1.default.validateRefreshToken(refreshToken);
                if (!decoded) {
                    throw apiErrors_1.ApiError.UnauthorizedError();
                }
                const user = yield userModel_1.default.findById(decoded.id).select('-password');
                if (!user) {
                    throw apiErrors_1.ApiError.BadRequest('This account does not exist.');
                }
                const accessToken = (0, generateToken_1.generateAccessToken)({ id: user.id });
                //you must also generate new refresh token and send with cookie and 
                //dont forget model in db for refresh token
                res.json({ msg: 'Success!', accessToken });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new AuthCtrl();
