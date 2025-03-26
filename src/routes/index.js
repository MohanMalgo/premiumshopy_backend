import express from 'express';
import adminRoutes from './admin/admin.route.js';
import userRoutes from './user/user.route.js';

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/user', userRoutes);

export default router;
