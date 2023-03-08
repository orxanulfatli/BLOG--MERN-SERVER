"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const apiErrors_1 = require("../utils/apiErrors");
const errorMiddleware = (err, req, res, next) => {
    console.log(err);
    if (err instanceof apiErrors_1.ApiError) {
        return res.status(err.status).json({ success: false, message: err.message, errors: err.errors });
    }
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
};
exports.errorMiddleware = errorMiddleware;
