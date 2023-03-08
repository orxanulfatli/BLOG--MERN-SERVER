"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("../constants/index"));
class TokenService {
    constructor() {
        this.validateAccessToken = (token) => {
            try {
                return jsonwebtoken_1.default.verify(token, `${index_1.default.ACCESS_TOKEN_SECRET}`);
            }
            catch (error) {
                return null;
            }
        };
        this.validateRefreshToken = (token) => {
            try {
                return jsonwebtoken_1.default.verify(token, `${index_1.default.REFRESH_TOKEN_SECRET}`);
            }
            catch (error) {
                return null;
            }
        };
    }
}
exports.default = new TokenService();
