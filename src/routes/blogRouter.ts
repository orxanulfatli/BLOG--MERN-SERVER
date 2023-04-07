import { Router } from 'express';
import { auth } from '../middleware/auth';
import blogCtrl from '../controllers/blogCtrl'

const router = Router();

router.post('/blog', auth, blogCtrl.createBlog);
router.get('/home/blogs', blogCtrl.getHomeBlogs);
router.get('/blogs/category/:id', blogCtrl.getBlogsByCategory);
router.get('/blogs/user/:id', blogCtrl.getBlogsByUser);



export default router