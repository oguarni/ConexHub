import express from 'express';
import notificationController from '../controllers/notificationController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:notificationId/read', notificationController.markAsRead);
router.post('/test', notificationController.testNotification);

export default router;