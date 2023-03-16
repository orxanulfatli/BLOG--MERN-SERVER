import { Router } from 'express';
import userCtrl from '../controllers/userCtrl';
import { auth } from '../middleware/auth';


const router = Router()

router.patch('/update_user', auth, userCtrl.updateUser)

export default router