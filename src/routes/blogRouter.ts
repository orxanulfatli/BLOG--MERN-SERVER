import { Router } from 'express';
import { auth } from '../middleware/auth';
import blogCtrl from '../controllers/blogCtrl'

const router = Router();

router.post('/blog', auth, blogCtrl.createBlog);
router.get('/home/blogs', blogCtrl.getHomeBlogs)
router.get('/blogs/:category_id', blogCtrl.getBlogsByCategory)


export default router