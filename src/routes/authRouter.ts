import { Router } from 'express';
import authCtrl from '../controllers/authCtrl';
import {validRegister} from '../middleware/valid'

const router = Router();

router.post('/register', validRegister, authCtrl.register);
router.post('/active', authCtrl.activeAccount);
router.post('/login', authCtrl.login);
router.get('/logout', authCtrl.logout);
router.get('/refresh_token', authCtrl.refresh);






export default router;