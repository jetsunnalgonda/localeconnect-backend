import { Router } from 'express';

import registerRoute from './registerRoute.js';
import profileRoutes from './profileRoutes.js';
import loginRoute from './loginRoute.js';
import likeRoutes from './likeRoutes.js';
import feedRoutes from './feedRoutes.js';
import urlRoutes from './urlRoutes.js';
import refreshRoute from './refreshRoute.js';
import authRoutes from './authRoutes.js';
import otherRoutes from './otherRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

router.use('/', registerRoute);
router.use('/', loginRoute);
router.use('/', profileRoutes);
router.use('/', likeRoutes);
router.use('/', feedRoutes);
router.use('/', urlRoutes);
router.use('/', refreshRoute);
router.use('/', authRoutes)
router.use('/', notificationRoutes)
router.use('/', otherRoutes);

export default router;
