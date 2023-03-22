import { Router } from 'express';
import categoryCtrl from '../controllers/categoryCtrl';
import { auth } from '../middleware/auth';
import { validCategory } from '../middleware/valid';
const router = Router();


router.route('/category')
    .post(auth,validCategory, categoryCtrl.createCategory)
    .get(categoryCtrl.getCategories)

router.route('/category/:id')
    .patch(auth,validCategory,categoryCtrl.updateCategory)
    .delete(auth, categoryCtrl.deleteCategory)
export default router
