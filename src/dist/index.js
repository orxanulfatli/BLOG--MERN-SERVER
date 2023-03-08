"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const error_1 = require("./middleware/error");
//import Application constants
const index_2 = __importDefault(require("./constants/index"));
//Middleware
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
//Routes
app.use('/api', index_1.default.authRouter);
//error middleware
app.use(error_1.errorMiddleware);
//DB
require("./config/database");
//server listening
app.listen(index_2.default.PORT, () => {
    console.log('Server is running on port', index_2.default.PORT);
});
