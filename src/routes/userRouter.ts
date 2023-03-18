import { Router } from 'express';
import userCtrl from '../controllers/userCtrl';
import { auth } from '../middleware/auth';


const router = Router()

router.patch('/update_user', auth, userCtrl.updateUser)
router.patch('/reset_password', auth, userCtrl.resetPassword)


export default router