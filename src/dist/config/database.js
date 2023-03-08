"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../constants/index"));
mongoose_1.default.connect(`${index_1.default.DB}`).then(() => {
    console.log('db is connecting');
}).catch((err) => {
    console.log(err);
});
