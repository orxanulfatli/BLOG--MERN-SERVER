import { Router } from 'express';
import authCtrl from '../controllers/authCtrl';
import {validRegister} from '../middleware/valid'

const router = Router();

router.post('/register',validRegister,authCtrl.register)


export default router;