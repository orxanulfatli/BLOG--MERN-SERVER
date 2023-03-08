"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authCtrl_1 = __importDefault(require("../controllers/authCtrl"));
const valid_1 = require("../middleware/valid");
const router = (0, express_1.Router)();
router.post('/register', valid_1.validRegister, authCtrl_1.default.register);
router.post('/active', authCtrl_1.default.activeAccount);
router.post('/login', authCtrl_1.default.login);
router.get('/logout', authCtrl_1.default.logout);
router.get('/refresh_token', authCtrl_1.default.refresh);
exports.default = router;
